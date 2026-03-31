import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BusinessSettingsClient } from "@/components/settings/business-settings-client";
import { getRequiredSession } from "@/lib/auth";
import { getWorkspaceAssistantSettings } from "@/services/assistant/assistant-knowledge.service";
import { getWorkspaceBusinessSettings } from "@/services/workspace/workspace-settings.service";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your business details and default reply.",
};

export default async function DashboardSettingsPage() {
  const session = await getRequiredSession();

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  if (!session.user.workspaceId) {
    redirect("/dashboard");
  }

  const [settings, assistantSettings] = await Promise.all([
    getWorkspaceBusinessSettings(session.user.workspaceId),
    getWorkspaceAssistantSettings(session.user.workspaceId),
  ]);

  return (
    <BusinessSettingsClient
      initialSettings={settings}
      initialAssistantSettings={assistantSettings}
    />
  );
}
