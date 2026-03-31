import { getCurrentSession } from "@/lib/auth";
import type { AppUserRole } from "@/types/auth";

export class WorkspaceAuthorizationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "WorkspaceAuthorizationError";
  }
}

export class WorkspacePermissionError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "WorkspacePermissionError";
  }
}

export async function getRequiredWorkspaceContext() {
  const session = await getCurrentSession();

  if (!session?.user?.id || !session.user.workspaceId) {
    throw new WorkspaceAuthorizationError();
  }

  return {
    userId: session.user.id,
    role: session.user.role as AppUserRole,
    workspaceId: session.user.workspaceId,
  };
}

export async function getRequiredWorkspaceOwnerContext() {
  const context = await getRequiredWorkspaceContext();

  if (context.role !== "OWNER") {
    throw new WorkspacePermissionError(
      "Only the business owner can manage this section.",
    );
  }

  return context;
}

export async function getRequiredWorkspaceManagerContext() {
  const context = await getRequiredWorkspaceContext();

  if (context.role !== "OWNER" && context.role !== "ADMIN") {
    throw new WorkspacePermissionError(
      "Only the business owner or an admin can manage these settings.",
    );
  }

  return context;
}
