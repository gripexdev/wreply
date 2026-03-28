import { getCurrentSession } from "@/lib/auth";

export class WorkspaceAuthorizationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "WorkspaceAuthorizationError";
  }
}

export async function getRequiredWorkspaceContext() {
  const session = await getCurrentSession();

  if (!session?.user?.id || !session.user.workspaceId) {
    throw new WorkspaceAuthorizationError();
  }

  return {
    userId: session.user.id,
    workspaceId: session.user.workspaceId,
  };
}
