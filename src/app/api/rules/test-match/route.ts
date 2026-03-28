import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceContext } from "@/lib/workspace-auth";
import { testWorkspaceMessageMatch } from "@/services/messages/message-matching.service";

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await getRequiredWorkspaceContext();
    const payload = await request.json().catch(() => null);
    const result = await testWorkspaceMessageMatch(workspaceId, payload);

    return NextResponse.json({
      result,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
