import { Prisma } from "@prisma/client";

import { prisma } from "@/database/client";
import {
  updateWorkspaceBusinessSettingsSchema,
  type UpdateWorkspaceBusinessSettingsInput,
} from "@/lib/validation/workspace-settings";
import type {
  WorkspaceBusinessSettingsMutationResponse,
  WorkspaceBusinessSettingsView,
} from "@/types/settings";

export class WorkspaceSettingsServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "WorkspaceSettingsServiceError";
  }
}

type WorkspaceBusinessSettingsRecord = Prisma.WorkspaceGetPayload<{
  select: {
    id: true;
    name: true;
    replyDisplayName: true;
    businessPhoneNumber: true;
    address: true;
    googleMapsLink: true;
    workingHours: true;
    languagePreference: true;
    fallbackReplyEnabled: true;
    fallbackReplyMessage: true;
    updatedAt: true;
  };
}>;

function toWorkspaceBusinessSettingsView(
  workspace: WorkspaceBusinessSettingsRecord | null,
): WorkspaceBusinessSettingsView {
  if (!workspace) {
    throw new WorkspaceSettingsServiceError("Workspace not found.", 404);
  }

  return {
    workspaceId: workspace.id,
    businessName: workspace.name,
    replyDisplayName: workspace.replyDisplayName ?? "",
    businessPhoneNumber: workspace.businessPhoneNumber ?? "",
    address: workspace.address ?? "",
    googleMapsLink: workspace.googleMapsLink ?? "",
    workingHours: workspace.workingHours ?? "",
    languagePreference: workspace.languagePreference,
    fallbackReplyEnabled: workspace.fallbackReplyEnabled,
    fallbackReplyMessage: workspace.fallbackReplyMessage ?? "",
    updatedAt: workspace.updatedAt.toISOString(),
  };
}

export async function getWorkspaceBusinessSettings(workspaceId: string) {
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
      fallbackReplyEnabled: true,
      fallbackReplyMessage: true,
      updatedAt: true,
    },
  });

  return toWorkspaceBusinessSettingsView(workspace);
}

export async function updateWorkspaceBusinessSettings(
  workspaceId: string,
  rawInput: UpdateWorkspaceBusinessSettingsInput,
): Promise<WorkspaceBusinessSettingsMutationResponse> {
  const input = updateWorkspaceBusinessSettingsSchema.parse(rawInput);
  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      name: input.businessName,
      replyDisplayName: input.replyDisplayName ?? null,
      businessPhoneNumber: input.businessPhoneNumber ?? null,
      address: input.address ?? null,
      googleMapsLink: input.googleMapsLink ?? null,
      workingHours: input.workingHours ?? null,
      languagePreference: input.languagePreference,
      fallbackReplyEnabled: input.fallbackReplyEnabled,
      fallbackReplyMessage: input.fallbackReplyMessage ?? null,
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
      fallbackReplyEnabled: true,
      fallbackReplyMessage: true,
      updatedAt: true,
    },
  });

  return {
    message: "Business settings saved successfully.",
    settings: toWorkspaceBusinessSettingsView(workspace),
  };
}

export async function getWorkspaceFallbackSettings(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      replyDisplayName: true,
      languagePreference: true,
      fallbackReplyEnabled: true,
      fallbackReplyMessage: true,
    },
  });

  if (!workspace) {
    throw new WorkspaceSettingsServiceError("Workspace not found.", 404);
  }

  return {
    workspaceId: workspace.id,
    businessName: workspace.name,
    replyDisplayName: workspace.replyDisplayName,
    languagePreference: workspace.languagePreference,
    fallbackReplyEnabled: workspace.fallbackReplyEnabled,
    fallbackReplyMessage: workspace.fallbackReplyMessage,
  };
}
