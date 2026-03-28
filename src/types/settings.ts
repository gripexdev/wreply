import type { RuleLanguage } from "@/types/rules";

export interface WorkspaceBusinessSettingsView {
  workspaceId: string;
  businessName: string;
  replyDisplayName: string;
  businessPhoneNumber: string;
  address: string;
  googleMapsLink: string;
  workingHours: string;
  languagePreference: RuleLanguage;
  fallbackReplyEnabled: boolean;
  fallbackReplyMessage: string;
  updatedAt: string;
}

export interface WorkspaceBusinessSettingsMutationResponse {
  message: string;
  settings: WorkspaceBusinessSettingsView;
}
