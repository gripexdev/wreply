import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";

import { env } from "@/config/env";
import { whatsappStatusMeta } from "@/config/whatsapp";
import { prisma } from "@/database/client";
import { maskSecretValue, decryptSecretValue, encryptSecretValue } from "@/lib/whatsapp/secrets";
import {
  updateWhatsAppConnectionSchema,
  type UpdateWhatsAppConnectionInput,
} from "@/lib/validation/whatsapp-connection";
import { WhatsAppConnectionServiceError } from "@/services/whatsapp/whatsapp-errors";
import type {
  WhatsAppConnectionMutationResponse,
  WhatsAppConnectionSettingsView,
  WhatsAppUiStatus,
} from "@/types/whatsapp";

type RawWhatsAppConnection = Awaited<
  ReturnType<typeof prisma.whatsAppConnection.findUnique>
>;

function buildWebhookUrl(webhookKey: string | null) {
  return webhookKey
    ? `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp/${webhookKey}`
    : null;
}

function buildDefaultConnectionView(): WhatsAppConnectionSettingsView {
  const statusMeta = whatsappStatusMeta.not_configured;

  return {
    id: null,
    label: "Primary WhatsApp line",
    phoneNumber: "",
    phoneNumberId: "",
    businessAccountId: "",
    webhookUrl: null,
    webhookKey: null,
    webhookSubscribed: false,
    sendRepliesEnabled: false,
    status: "not_configured",
    statusLabel: statusMeta.label,
    statusDescription: statusMeta.description,
    accessTokenConfigured: false,
    verifyTokenConfigured: false,
    appSecretConfigured: false,
    accessTokenPreview: null,
    verifyTokenPreview: null,
    appSecretPreview: null,
    lastWebhookAt: null,
    lastVerifiedAt: null,
    recentIncomingCount: 0,
    preparedOutgoingCount: 0,
    sentOutgoingCount: 0,
    failedOutgoingCount: 0,
    signatureVerificationEnabled: false,
    canReceiveWebhooks: false,
    canAttemptLiveReplies: false,
  };
}

function deriveUiStatus(input: {
  hasVerifyToken: boolean;
  hasPhoneNumberId: boolean;
  webhookSubscribed: boolean;
  lastWebhookAt: Date | null;
}): WhatsAppUiStatus {
  if (!input.hasPhoneNumberId || !input.hasVerifyToken) {
    return "requires_action";
  }

  if (input.lastWebhookAt) {
    return "webhook_active";
  }

  if (input.webhookSubscribed) {
    return "ready_for_testing";
  }

  return "configured";
}

function getPreview(encryptedValue: string | null | undefined) {
  return maskSecretValue(decryptSecretValue(encryptedValue));
}

async function buildConnectionView(
  connection: NonNullable<RawWhatsAppConnection>,
): Promise<WhatsAppConnectionSettingsView> {
  const [
    recentIncomingCount,
    preparedOutgoingCount,
    sentOutgoingCount,
    failedOutgoingCount,
  ] = await Promise.all([
    prisma.incomingMessageLog.count({
      where: {
        whatsAppConnectionId: connection.id,
      },
    }),
    prisma.outgoingMessageLog.count({
      where: {
        whatsAppConnectionId: connection.id,
        status: "PREPARED",
      },
    }),
    prisma.outgoingMessageLog.count({
      where: {
        whatsAppConnectionId: connection.id,
        status: "SENT",
      },
    }),
    prisma.outgoingMessageLog.count({
      where: {
        whatsAppConnectionId: connection.id,
        status: "FAILED",
      },
    }),
  ]);

  const hasVerifyToken = Boolean(connection.verifyTokenEncrypted);
  const hasPhoneNumberId = Boolean(connection.phoneNumberId);
  const status = deriveUiStatus({
    hasVerifyToken,
    hasPhoneNumberId,
    webhookSubscribed: connection.webhookSubscribed,
    lastWebhookAt: connection.lastWebhookAt,
  });
  const statusMeta = whatsappStatusMeta[status];
  const canReceiveWebhooks = hasVerifyToken && hasPhoneNumberId;
  const canAttemptLiveReplies =
    connection.sendRepliesEnabled &&
    Boolean(connection.accessTokenEncrypted) &&
    hasPhoneNumberId;

  return {
    id: connection.id,
    label: connection.label,
    phoneNumber: connection.phoneNumber ?? "",
    phoneNumberId: connection.phoneNumberId ?? "",
    businessAccountId: connection.businessAccountId ?? "",
    webhookUrl: buildWebhookUrl(connection.webhookKey),
    webhookKey: connection.webhookKey,
    webhookSubscribed: connection.webhookSubscribed,
    sendRepliesEnabled: connection.sendRepliesEnabled,
    status,
    statusLabel: statusMeta.label,
    statusDescription: statusMeta.description,
    accessTokenConfigured: Boolean(connection.accessTokenEncrypted),
    verifyTokenConfigured: hasVerifyToken,
    appSecretConfigured: Boolean(connection.appSecretEncrypted),
    accessTokenPreview: getPreview(connection.accessTokenEncrypted),
    verifyTokenPreview: getPreview(connection.verifyTokenEncrypted),
    appSecretPreview: getPreview(connection.appSecretEncrypted),
    lastWebhookAt: connection.lastWebhookAt?.toISOString() ?? null,
    lastVerifiedAt: connection.lastVerifiedAt?.toISOString() ?? null,
    recentIncomingCount,
    preparedOutgoingCount,
    sentOutgoingCount,
    failedOutgoingCount,
    signatureVerificationEnabled: Boolean(connection.appSecretEncrypted),
    canReceiveWebhooks,
    canAttemptLiveReplies,
  };
}

function generateWebhookKey() {
  return randomBytes(16).toString("hex");
}

function resolveSecretUpdate(
  submittedValue: string | null | undefined,
  currentEncryptedValue: string | null | undefined,
) {
  if (!submittedValue) {
    return currentEncryptedValue ?? null;
  }

  return encryptSecretValue(submittedValue);
}

export async function getWorkspaceWhatsAppConnectionSettings(workspaceId: string) {
  const connection = await prisma.whatsAppConnection.findUnique({
    where: {
      workspaceId,
    },
  });

  if (!connection) {
    return buildDefaultConnectionView();
  }

  return buildConnectionView(connection);
}

export async function upsertWorkspaceWhatsAppConnection(
  workspaceId: string,
  rawInput: UpdateWhatsAppConnectionInput,
): Promise<WhatsAppConnectionMutationResponse> {
  const input = updateWhatsAppConnectionSchema.parse(rawInput);
  const existingConnection = await prisma.whatsAppConnection.findUnique({
    where: {
      workspaceId,
    },
  });
  const nextAccessTokenEncrypted = resolveSecretUpdate(
    input.accessToken,
    existingConnection?.accessTokenEncrypted,
  );
  const nextVerifyTokenEncrypted = resolveSecretUpdate(
    input.verifyToken,
    existingConnection?.verifyTokenEncrypted,
  );
  const nextAppSecretEncrypted = resolveSecretUpdate(
    input.appSecret,
    existingConnection?.appSecretEncrypted,
  );

  if (input.sendRepliesEnabled && !input.phoneNumberId && !existingConnection?.phoneNumberId) {
    throw new WhatsAppConnectionServiceError(
      "Phone number ID is required before enabling live replies.",
      400,
    );
  }

  if (input.sendRepliesEnabled && !nextAccessTokenEncrypted) {
    throw new WhatsAppConnectionServiceError(
      "A permanent access token is required before enabling live replies.",
      400,
    );
  }

  try {
    const connection = await prisma.whatsAppConnection.upsert({
      where: {
        workspaceId,
      },
      update: {
        label: input.label,
        phoneNumber: input.phoneNumber ?? null,
        phoneNumberId: input.phoneNumberId ?? null,
        businessAccountId: input.businessAccountId ?? null,
        accessTokenEncrypted: nextAccessTokenEncrypted,
        verifyTokenEncrypted: nextVerifyTokenEncrypted,
        appSecretEncrypted: nextAppSecretEncrypted,
        webhookSubscribed: input.webhookSubscribed,
        sendRepliesEnabled: input.sendRepliesEnabled,
        status:
          input.phoneNumberId || existingConnection?.phoneNumberId
            ? input.verifyToken || existingConnection?.verifyTokenEncrypted
              ? "CONNECTED"
              : "REQUIRES_ACTION"
            : "PENDING",
      },
      create: {
        workspaceId,
        label: input.label,
        phoneNumber: input.phoneNumber ?? null,
        phoneNumberId: input.phoneNumberId ?? null,
        businessAccountId: input.businessAccountId ?? null,
        accessTokenEncrypted: nextAccessTokenEncrypted,
        verifyTokenEncrypted: nextVerifyTokenEncrypted,
        appSecretEncrypted: nextAppSecretEncrypted,
        webhookKey: generateWebhookKey(),
        webhookSubscribed: input.webhookSubscribed,
        sendRepliesEnabled: input.sendRepliesEnabled,
        status: input.phoneNumberId && nextVerifyTokenEncrypted ? "CONNECTED" : "PENDING",
      },
    });

    return {
      message: "WhatsApp connection settings saved successfully.",
      connection: await buildConnectionView(connection),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new WhatsAppConnectionServiceError(
        "This phone number ID is already linked to another workspace connection.",
        409,
      );
    }

    throw error;
  }
}

export async function getWhatsAppConnectionByWebhookKey(webhookKey: string) {
  const connection = await prisma.whatsAppConnection.findUnique({
    where: {
      webhookKey,
    },
  });

  if (!connection) {
    throw new WhatsAppConnectionServiceError(
      "WhatsApp connection not found for this webhook URL.",
      404,
    );
  }

  return {
    ...connection,
    accessToken: decryptSecretValue(connection.accessTokenEncrypted),
    verifyToken: decryptSecretValue(connection.verifyTokenEncrypted),
    appSecret: decryptSecretValue(connection.appSecretEncrypted),
  };
}

export async function getWhatsAppConnectionByPhoneNumberId(phoneNumberId: string) {
  const connection = await prisma.whatsAppConnection.findUnique({
    where: {
      phoneNumberId,
    },
  });

  if (!connection) {
    throw new WhatsAppConnectionServiceError(
      "No workspace connection matches this WhatsApp phone number ID.",
      404,
    );
  }

  return {
    ...connection,
    accessToken: decryptSecretValue(connection.accessTokenEncrypted),
    verifyToken: decryptSecretValue(connection.verifyTokenEncrypted),
    appSecret: decryptSecretValue(connection.appSecretEncrypted),
  };
}
