export type WhatsAppUiStatus =
  | "not_configured"
  | "requires_action"
  | "configured"
  | "ready_for_testing"
  | "webhook_active";

export interface WhatsAppConnectionSettingsView {
  id: string | null;
  label: string;
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl: string | null;
  webhookKey: string | null;
  webhookSubscribed: boolean;
  sendRepliesEnabled: boolean;
  status: WhatsAppUiStatus;
  statusLabel: string;
  statusDescription: string;
  accessTokenConfigured: boolean;
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
  accessTokenPreview: string | null;
  verifyTokenPreview: string | null;
  appSecretPreview: string | null;
  lastWebhookAt: string | null;
  lastVerifiedAt: string | null;
  recentIncomingCount: number;
  preparedOutgoingCount: number;
  sentOutgoingCount: number;
  failedOutgoingCount: number;
  signatureVerificationEnabled: boolean;
  canReceiveWebhooks: boolean;
  canAttemptLiveReplies: boolean;
}

export interface WhatsAppConnectionMutationResponse {
  message: string;
  connection: WhatsAppConnectionSettingsView;
}

export interface ParsedWhatsAppTextMessage {
  externalMessageId: string;
  phoneNumberId: string | null;
  displayPhoneNumber: string | null;
  senderPhone: string;
  recipientPhone: string;
  messageText: string;
  customerName: string | null;
  receivedAt: string | null;
  payloadFragment: unknown;
}

export interface WhatsAppWebhookProcessingSummary {
  connectionId: string;
  acceptedEvents: number;
  ignoredEvents: number;
  duplicateEvents: number;
  preparedReplies: number;
  sentReplies: number;
  failedReplies: number;
}
