import { MessageType, Prisma, type OutgoingReplySource } from "@prisma/client";

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
import { getWorkspaceFallbackSettings } from "@/services/workspace/workspace-settings.service";
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

async function getCachedWorkspaceFallbackSettings(
  cache: Map<string, Awaited<ReturnType<typeof getWorkspaceFallbackSettings>>>,
  workspaceId: string,
) {
  const cachedSettings = cache.get(workspaceId);

  if (cachedSettings) {
    return cachedSettings;
  }

  const settings = await getWorkspaceFallbackSettings(workspaceId);
  cache.set(workspaceId, settings);

  return settings;
}

function buildReplyOutcomeReason(
  replySource: OutgoingReplySource,
  deliveryState: "PREPARED" | "SENT" | "FAILED",
) {
  const sourceLabel =
    replySource === "FALLBACK" ? "workspace fallback reply" : "matched rule reply";

  if (deliveryState === "SENT") {
    return `A ${sourceLabel} was sent successfully.`;
  }

  if (deliveryState === "FAILED") {
    return `A ${sourceLabel} send attempt failed and was logged for follow-up.`;
  }

  return `A ${sourceLabel} was prepared and logged without a live send attempt.`;
}

async function createAndDispatchReply(input: {
  workspaceId: string;
  connection: Awaited<ReturnType<typeof getWhatsAppConnectionByPhoneNumberId>>;
  incomingLogId: string;
  recipientPhone: string;
  messageBody: string;
  matchedRuleId: string | null;
  replySource: OutgoingReplySource;
  payloadMetadata: Record<string, Prisma.InputJsonValue | null>;
}) {
  const outgoingLog = await prisma.outgoingMessageLog.create({
    data: {
      workspaceId: input.workspaceId,
      whatsAppConnectionId: input.connection.id,
      matchedRuleId: input.matchedRuleId,
      relatedIncomingMessageId: input.incomingLogId,
      recipientPhone: input.recipientPhone,
      messageType: MessageType.TEXT,
      content: input.messageBody,
      status: "PREPARED",
      replySource: input.replySource,
      failureReason: input.connection.sendRepliesEnabled
        ? null
        : "Live WhatsApp sending is disabled for this workspace connection.",
      payload: {
        ...input.payloadMetadata,
        replySource: input.replySource,
      },
    },
    select: {
      id: true,
    },
  });

  if (!input.connection.sendRepliesEnabled) {
    return {
      deliveryState: "PREPARED" as const,
    };
  }

  if (!input.connection.accessToken || !input.connection.phoneNumberId) {
    await prisma.outgoingMessageLog.update({
      where: {
        id: outgoingLog.id,
      },
      data: {
        failureReason:
          "Live reply sending was enabled, but required WhatsApp credentials are incomplete.",
      },
    });

    return {
      deliveryState: "PREPARED" as const,
    };
  }

  try {
    const sendResult = await sendWhatsAppTextMessage({
      accessToken: input.connection.accessToken,
      phoneNumberId: input.connection.phoneNumberId,
      recipientPhone: input.recipientPhone,
      messageBody: input.messageBody,
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
          payload: toTopLevelJsonPayload({
            ...input.payloadMetadata,
            replySource: input.replySource,
            providerResponse: toNestedJsonValue(sendResult.payload),
          }),
        },
      });

      return {
        deliveryState: "FAILED" as const,
      };
    }

    await prisma.outgoingMessageLog.update({
      where: {
        id: outgoingLog.id,
      },
      data: {
        status: "SENT",
        externalMessageId: sendResult.providerMessageId,
        failureReason: null,
        payload: toTopLevelJsonPayload({
          ...input.payloadMetadata,
          replySource: input.replySource,
          providerResponse: toNestedJsonValue(sendResult.payload),
        }),
        sentAt: new Date(),
      },
    });

    return {
      deliveryState: "SENT" as const,
    };
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

    return {
      deliveryState: "FAILED" as const,
    };
  }
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
  const workspaceFallbackSettingsCache = new Map<
    string,
    Awaited<ReturnType<typeof getWorkspaceFallbackSettings>>
  >();

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
          contactName: message.customerName,
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

    if (!incomingLogId) {
      throw new WhatsAppWebhookServiceError(
        "Unable to create an inbound message log for this webhook event.",
        500,
      );
    }

    const matchResult = await testWorkspaceMessageMatch(
      resolvedConnection.workspaceId,
      {
        message: message.messageText,
      },
    );

    summary.acceptedEvents += 1;
    await markWebhookSeen(
      resolvedConnection.id,
      message.recipientPhone || resolvedConnection.phoneNumber,
    );

    let fallbackUsed = false;
    let processingReason = matchResult.reason;

    if (matchResult.matched && matchResult.matchedRule) {
      const replyOutcome = await createAndDispatchReply({
        workspaceId: resolvedConnection.workspaceId,
        connection: resolvedConnection,
        incomingLogId,
        recipientPhone: message.senderPhone,
        messageBody: matchResult.matchedRule.replyMessage,
        matchedRuleId: matchResult.matchedRuleId,
        replySource: "RULE_MATCH",
        payloadMetadata: {
          matchResult: toNestedJsonValue(matchResult),
        },
      });

      if (replyOutcome.deliveryState === "FAILED") {
        summary.failedReplies += 1;
      } else if (replyOutcome.deliveryState === "SENT") {
        summary.sentReplies += 1;
      } else {
        summary.preparedReplies += 1;
      }

      processingReason = `${matchResult.reason} ${buildReplyOutcomeReason(
        "RULE_MATCH",
        replyOutcome.deliveryState,
      )}`;
    } else {
      const fallbackSettings = await getCachedWorkspaceFallbackSettings(
        workspaceFallbackSettingsCache,
        resolvedConnection.workspaceId,
      );
      const fallbackMessage = fallbackSettings.fallbackReplyMessage?.trim() ?? "";

      if (fallbackSettings.fallbackReplyEnabled && fallbackMessage) {
        fallbackUsed = true;

        const replyOutcome = await createAndDispatchReply({
          workspaceId: resolvedConnection.workspaceId,
          connection: resolvedConnection,
          incomingLogId,
          recipientPhone: message.senderPhone,
          messageBody: fallbackMessage,
          matchedRuleId: null,
          replySource: "FALLBACK",
          payloadMetadata: {
            fallbackMessage,
            fallbackSettings: toNestedJsonValue({
              businessName: fallbackSettings.businessName,
              replyDisplayName: fallbackSettings.replyDisplayName,
              languagePreference: fallbackSettings.languagePreference,
            }),
            matchResult: toNestedJsonValue(matchResult),
          },
        });

        processingReason = `${matchResult.reason} ${buildReplyOutcomeReason(
          "FALLBACK",
          replyOutcome.deliveryState,
        )}`;

        if (replyOutcome.deliveryState === "FAILED") {
          summary.failedReplies += 1;
        } else if (replyOutcome.deliveryState === "SENT") {
          summary.sentReplies += 1;
        } else {
          summary.preparedReplies += 1;
        }
      } else {
        processingReason = `${matchResult.reason} Workspace fallback reply is disabled or missing.`;
      }
    }

    await prisma.incomingMessageLog.update({
      where: {
        id: incomingLogId,
      },
      data: {
        matchedRuleId: matchResult.matchedRuleId,
        normalizedContent: matchResult.normalizedMessage,
        processingStatus: matchResult.matched ? "MATCHED" : "NO_MATCH",
        processingReason: processingReason,
        fallbackEligible: matchResult.fallbackEligible,
        fallbackUsed: fallbackUsed,
        processedAt: new Date(),
        payload: {
          rawEvent: toNestedJsonValue(message.payloadFragment),
          customerName: message.customerName,
          matchResult: toNestedJsonValue(matchResult),
          fallbackUsed: fallbackUsed,
        },
      },
    });
  }

  return summary;
}
