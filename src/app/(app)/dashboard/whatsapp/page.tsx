import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WhatsAppSettingsClient } from "@/components/whatsapp/whatsapp-settings-client";
import { getRequiredSession } from "@/lib/auth";
import { getWorkspaceWhatsAppConnectionSettings } from "@/services/whatsapp/whatsapp-connection.service";

export const metadata: Metadata = {
  title: "WhatsApp",
  description:
    "Manage WhatsApp Cloud API webhook settings and inbound reply processing for the current workspace.",
};

export default async function DashboardWhatsAppPage() {
  const session = await getRequiredSession();

  if (session.user.role !== "OWNER") {
    redirect("/dashboard");
  }

  const connection = session.user.workspaceId
    ? await getWorkspaceWhatsAppConnectionSettings(session.user.workspaceId)
    : null;

  return (
    <WhatsAppSettingsClient
      initialConnection={
        connection ?? {
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
          statusLabel: "Not configured",
          statusDescription:
            "Save your phone number identifiers and verification token to activate webhook setup.",
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
        }
      }
    />
  );
}
