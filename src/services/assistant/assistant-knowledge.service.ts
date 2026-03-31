import { Prisma } from "@prisma/client";

import { env } from "@/config/env";
import { prisma } from "@/database/client";
import { extractWebsiteKnowledge } from "@/lib/assistant/website-content";
import {
  updateWorkspaceAssistantSettingsSchema,
  type UpdateWorkspaceAssistantSettingsInput,
} from "@/lib/validation/assistant-training";
import type {
  WorkspaceAssistantContext,
  WorkspaceAssistantSettingsMutationResponse,
  WorkspaceAssistantSettingsView,
} from "@/types/assistant";

export class AssistantKnowledgeServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AssistantKnowledgeServiceError";
  }
}

type WorkspaceAssistantRecord = Prisma.WorkspaceGetPayload<{
  select: {
    id: true;
    name: true;
    replyDisplayName: true;
    businessPhoneNumber: true;
    address: true;
    googleMapsLink: true;
    workingHours: true;
    languagePreference: true;
    assistantWebsiteUrl: true;
    assistantWebsiteContent: true;
    assistantManualKnowledge: true;
    assistantKnowledgeUpdatedAt: true;
  };
}>;

function getAssistantKnowledgeCharacterCount(
  workspace: WorkspaceAssistantRecord,
) {
  return (
    (workspace.assistantManualKnowledge?.trim().length ?? 0) +
    (workspace.assistantWebsiteContent?.trim().length ?? 0)
  );
}

function toAssistantStatus(workspace: WorkspaceAssistantRecord) {
  const hasKnowledge = getAssistantKnowledgeCharacterCount(workspace) > 0;

  if (!hasKnowledge) {
    return {
      status: "MISSING_KNOWLEDGE" as const,
      statusLabel: "Not ready",
    };
  }

  if (!env.OPENAI_API_KEY) {
    return {
      status: "MISSING_API_KEY" as const,
      statusLabel: "Unavailable",
    };
  }

  return {
    status: "READY" as const,
    statusLabel: "Ready",
  };
}

function toWorkspaceAssistantSettingsView(
  workspace: WorkspaceAssistantRecord | null,
): WorkspaceAssistantSettingsView {
  if (!workspace) {
    throw new AssistantKnowledgeServiceError("Business not found.", 404);
  }

  const status = toAssistantStatus(workspace);

  return {
    workspaceId: workspace.id,
    websiteUrl: workspace.assistantWebsiteUrl ?? "",
    manualKnowledge: workspace.assistantManualKnowledge ?? "",
    knowledgeCharacterCount: getAssistantKnowledgeCharacterCount(workspace),
    hasWebsiteContent: Boolean(workspace.assistantWebsiteContent?.trim()),
    status: status.status,
    statusLabel: status.statusLabel,
    updatedAt: workspace.assistantKnowledgeUpdatedAt?.toISOString() ?? null,
  };
}

export async function getWorkspaceAssistantSettings(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      replyDisplayName: true,
      businessPhoneNumber: true,
      address: true,
      googleMapsLink: true,
      workingHours: true,
      languagePreference: true,
      assistantWebsiteUrl: true,
      assistantWebsiteContent: true,
      assistantManualKnowledge: true,
      assistantKnowledgeUpdatedAt: true,
    },
  });

  return toWorkspaceAssistantSettingsView(workspace);
}

export async function updateWorkspaceAssistantSettings(
  workspaceId: string,
  rawInput: UpdateWorkspaceAssistantSettingsInput,
): Promise<WorkspaceAssistantSettingsMutationResponse> {
  const input = updateWorkspaceAssistantSettingsSchema.parse(rawInput);
  let websiteContent: string | null = null;

  if (input.websiteUrl) {
    try {
      websiteContent = await extractWebsiteKnowledge(input.websiteUrl);
    } catch (error) {
      throw new AssistantKnowledgeServiceError(
        error instanceof Error
          ? `Could not read this website. ${error.message}`
          : "Could not read this website.",
        502,
      );
    }
  }

  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      assistantWebsiteUrl: input.websiteUrl ?? null,
      assistantWebsiteContent: websiteContent,
      assistantManualKnowledge: input.manualKnowledge ?? null,
      assistantKnowledgeUpdatedAt:
        input.websiteUrl || input.manualKnowledge ? new Date() : null,
    },
    select: {
      id: true,
      name: true,
      replyDisplayName: true,
      businessPhoneNumber: true,
      address: true,
      googleMapsLink: true,
      workingHours: true,
      languagePreference: true,
      assistantWebsiteUrl: true,
      assistantWebsiteContent: true,
      assistantManualKnowledge: true,
      assistantKnowledgeUpdatedAt: true,
    },
  });

  return {
    message: "Assistant details saved.",
    settings: toWorkspaceAssistantSettingsView(workspace),
  };
}

export async function getWorkspaceAssistantContext(
  workspaceId: string,
): Promise<WorkspaceAssistantContext> {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      replyDisplayName: true,
      businessPhoneNumber: true,
      address: true,
      googleMapsLink: true,
      workingHours: true,
      languagePreference: true,
      assistantWebsiteUrl: true,
      assistantWebsiteContent: true,
      assistantManualKnowledge: true,
    },
  });

  if (!workspace) {
    throw new AssistantKnowledgeServiceError("Business not found.", 404);
  }

  return {
    workspaceId: workspace.id,
    businessName: workspace.name,
    replyDisplayName: workspace.replyDisplayName,
    businessPhoneNumber: workspace.businessPhoneNumber,
    address: workspace.address,
    googleMapsLink: workspace.googleMapsLink,
    workingHours: workspace.workingHours,
    languagePreference: workspace.languagePreference,
    websiteUrl: workspace.assistantWebsiteUrl,
    websiteContent: workspace.assistantWebsiteContent,
    manualKnowledge: workspace.assistantManualKnowledge,
  };
}
