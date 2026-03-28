import { MessageType, Prisma } from "@prisma/client";

import { prisma } from "@/database/client";
import { parseWhatsAppTextMessages } from "@/lib/whatsapp/payload-parser";
import { verifyWhatsAppWebhookSignature } from "@/lib/whatsapp/verify-signature";
import { verifyWhatsAppWebhookChallenge } from "@/lib/whatsapp/webhook-verify";
import { testWorkspaceMessageMatch } from "@/services/messages/message-matching.service";
import { WhatsAppWebhookServiceError } from "@/services/whatsapp/whatsapp-errors";
import {
  getWhatsAppConnectionByPhoneNumberId,
  getWhatsAppConnectionByWebhookKey,
} from "@/services/whatsapp/whatsapp-connection.service";
import { sendWhatsAppTextMessage } from "@/services/whatsapp/whatsapp-send.service";
import type { WhatsAppWebhookProcessingSummary } from "@/types/whatsapp";

function parseWebhookPayload(rawBody: string) {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new WhatsAppWebhookServiceError("Invalid WhatsApp webhook payload.", 400);
  }
}

function toNestedJsonValue(value: unknown): Prisma.InputJsonValue | null {
  if (value === null || value === undefined) {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toTopLevelJsonPayload(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }

  return toNestedJsonValue(value) as Prisma.InputJsonValue;
}

async function markWebhookSeen(connectionId: string, phoneNumber: string | null) {
  await prisma.whatsAppConnection.update({
    where: {
      id: connectionId,
    },
    data: {
      lastWebhookAt: new Date(),
      phoneNumber: phoneNumber ?? undefined,
      status: "CONNECTED",
    },
  });
}

export async function verifyWhatsAppWebhookRequest(input: {
  webhookKey: string;
  mode: string | null;
  challenge: string | null;
  verifyToken: string | null;
}) {
  const connection = await getWhatsAppConnectionByWebhookKey(input.webhookKey);
  const verifiedChallenge = verifyWhatsAppWebhookChallenge({
    mode: input.mode,
    challenge: input.challenge,
    verifyToken: input.verifyToken,
    expectedVerifyToken: connection.verifyToken,
  });

  if (!verifiedChallenge) {
    throw new WhatsAppWebhookServiceError(
      "Webhook verification token is invalid.",
      403,
    );
  }

  await prisma.whatsAppConnection.update({
    where: {
      id: connection.id,
    },
    data: {
      lastVerifiedAt: new Date(),
      webhookSubscribed: true,
      status: "CONNECTED",
    },
  });

  return verifiedChallenge;
}

export async function processWhatsAppWebhookRequest(input: {
  webhookKey: string;
  rawBody: string;
  signatureHeader: string | null;
}): Promise<WhatsAppWebhookProcessingSummary> {
  const pathConnection = await getWhatsAppConnectionByWebhookKey(input.webhookKey);

  if (pathConnection.appSecret) {
    const signatureIsValid = verifyWhatsAppWebhookSignature({
      appSecret: pathConnection.appSecret,
      rawBody: input.rawBody,
      signatureHeader: input.signatureHeader,
    });

    if (!signatureIsValid) {
      throw new WhatsAppWebhookServiceError(
        "Webhook signature verification failed.",
        401,
      );
    }
  }

  const payload = parseWebhookPayload(input.rawBody);
  const parsedPayload = parseWhatsAppTextMessages(payload);
  const summary: WhatsAppWebhookProcessingSummary = {
    connectionId: pathConnection.id,
    acceptedEvents: 0,
    ignoredEvents: parsedPayload.ignoredEvents,
    duplicateEvents: 0,
    preparedReplies: 0,
    sentReplies: 0,
    failedReplies: 0,
  };

  if (parsedPayload.textMessages.length === 0) {
    await markWebhookSeen(pathConnection.id, pathConnection.phoneNumber);
    return summary;
  }

  for (const message of parsedPayload.textMessages) {
    if (!message.phoneNumberId) {
      summary.ignoredEvents += 1;
      continue;
    }

    let resolvedConnection: Awaited<
      ReturnType<typeof getWhatsAppConnectionByPhoneNumberId>
    >;

    try {
      resolvedConnection = await getWhatsAppConnectionByPhoneNumberId(
        message.phoneNumberId,
      );
    } catch {
      summary.ignoredEvents += 1;
      continue;
    }

    if (resolvedConnection.id !== pathConnection.id) {
      summary.ignoredEvents += 1;
      continue;
    }

    const receivedAt = message.receivedAt ? new Date(message.receivedAt) : new Date();
    let incomingLogId: string | null = null;

    try {
      const createdLog = await prisma.incomingMessageLog.create({
        data: {
          workspaceId: resolvedConnection.workspaceId,
          whatsAppConnectionId: resolvedConnection.id,
          externalMessageId: message.externalMessageId,
          senderPhone: message.senderPhone,
          recipientPhone:
            message.recipientPhone ||
            resolvedConnection.phoneNumber ||
            resolvedConnection.phoneNumberId ||
            "unknown",
          messageType: MessageType.TEXT,
          content: message.messageText,
          payload: {
            rawEvent: toNestedJsonValue(message.payloadFragment),
            customerName: message.customerName,
          },
          receivedAt,
        },
        select: {
          id: true,
        },
      });

      incomingLogId = createdLog.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        summary.duplicateEvents += 1;
        continue;
      }

      throw error;
    }

    const matchResult = await testWorkspaceMessageMatch(
      resolvedConnection.workspaceId,
      {
        message: message.messageText,
      },
    );

    await prisma.incomingMessageLog.update({
      where: {
        id: incomingLogId,
      },
      data: {
        matchedRuleId: matchResult.matchedRuleId,
        normalizedContent: matchResult.normalizedMessage,
        processingStatus: matchResult.matched ? "MATCHED" : "NO_MATCH",
        processingReason: matchResult.reason,
        processedAt: new Date(),
        payload: {
          rawEvent: toNestedJsonValue(message.payloadFragment),
          customerName: message.customerName,
          matchResult: toNestedJsonValue(matchResult),
        },
      },
    });

    summary.acceptedEvents += 1;
    await markWebhookSeen(
      resolvedConnection.id,
      message.recipientPhone || resolvedConnection.phoneNumber,
    );

    if (!matchResult.matched || !matchResult.matchedRule) {
      continue;
    }

    const outgoingLog = await prisma.outgoingMessageLog.create({
      data: {
        workspaceId: resolvedConnection.workspaceId,
        whatsAppConnectionId: resolvedConnection.id,
        matchedRuleId: matchResult.matchedRuleId,
        recipientPhone: message.senderPhone,
        messageType: MessageType.TEXT,
        content: matchResult.matchedRule.replyMessage,
        status: "PREPARED",
        failureReason: resolvedConnection.sendRepliesEnabled
          ? null
          : "Live WhatsApp sending is disabled for this workspace connection.",
        payload: {
          preparedFromMatch: toNestedJsonValue(matchResult),
        },
      },
      select: {
        id: true,
      },
    });

    if (!resolvedConnection.sendRepliesEnabled) {
      summary.preparedReplies += 1;
      continue;
    }

    if (!resolvedConnection.accessToken || !resolvedConnection.phoneNumberId) {
      await prisma.outgoingMessageLog.update({
        where: {
          id: outgoingLog.id,
        },
        data: {
          failureReason:
            "Live reply sending was enabled, but required WhatsApp credentials are incomplete.",
        },
      });
      summary.preparedReplies += 1;
      continue;
    }

    try {
      const sendResult = await sendWhatsAppTextMessage({
        accessToken: resolvedConnection.accessToken,
        phoneNumberId: resolvedConnection.phoneNumberId,
        recipientPhone: message.senderPhone,
        messageBody: matchResult.matchedRule.replyMessage,
      });

      if (!sendResult.ok) {
        await prisma.outgoingMessageLog.update({
          where: {
            id: outgoingLog.id,
          },
          data: {
            status: "FAILED",
            failureReason:
              sendResult.failureReason ??
              "WhatsApp Cloud API returned an unknown error.",
            payload: toTopLevelJsonPayload(sendResult.payload),
          },
        });
        summary.failedReplies += 1;
        continue;
      }

      await prisma.outgoingMessageLog.update({
        where: {
          id: outgoingLog.id,
        },
        data: {
          status: "SENT",
          externalMessageId: sendResult.providerMessageId,
          failureReason: null,
          payload: toTopLevelJsonPayload(sendResult.payload),
          sentAt: new Date(),
        },
      });
      summary.sentReplies += 1;
    } catch (error) {
      await prisma.outgoingMessageLog.update({
        where: {
          id: outgoingLog.id,
        },
        data: {
          status: "FAILED",
          failureReason:
            error instanceof Error
              ? error.message
              : "Unexpected error while sending the WhatsApp reply.",
        },
      });
      summary.failedReplies += 1;
    }
  }

  return summary;
}
