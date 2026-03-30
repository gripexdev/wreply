export type AssistantTrainingStatus =
  | "READY"
  | "MISSING_KNOWLEDGE"
  | "MISSING_API_KEY";

export interface WorkspaceAssistantSettingsView {
  workspaceId: string;
  websiteUrl: string;
  manualKnowledge: string;
  knowledgeCharacterCount: number;
  hasWebsiteContent: boolean;
  status: AssistantTrainingStatus;
  statusLabel: string;
  updatedAt: string | null;
}

export interface WorkspaceAssistantSettingsMutationResponse {
  message: string;
  settings: WorkspaceAssistantSettingsView;
}

export interface WorkspaceAssistantContext {
  workspaceId: string;
  businessName: string;
  replyDisplayName: string | null;
  businessPhoneNumber: string | null;
  address: string | null;
  googleMapsLink: string | null;
  workingHours: string | null;
  languagePreference: "ANY" | "DARIJA" | "FRENCH";
  websiteUrl: string | null;
  websiteContent: string | null;
  manualKnowledge: string | null;
}

export interface WorkspaceAssistantReplyResult {
  usedAiReply: boolean;
  replyMessage: string | null;
  usedSafeFallback: boolean;
  reason: string;
  model: string | null;
}
