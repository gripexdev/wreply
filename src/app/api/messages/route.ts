import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceContext } from "@/lib/workspace-auth";
import { listWorkspaceMessageLogs } from "@/services/messages/message-log.service";

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await getRequiredWorkspaceContext();
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const response = await listWorkspaceMessageLogs(workspaceId, query);

    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
