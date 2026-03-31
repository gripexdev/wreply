import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WhatsAppSettingsClient } from "@/components/whatsapp/whatsapp-settings-client";
import { getRequiredSession } from "@/lib/auth";
import { getWorkspaceWhatsAppConnectionSettings } from "@/services/whatsapp/whatsapp-connection.service";

export const metadata: Metadata = {
  title: "WhatsApp",
  description: "Connect your WhatsApp number and manage automatic replies.",
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
          statusLabel: "Not ready",
          statusDescription: "Add your WhatsApp details to get started.",
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
