import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceManagerContext } from "@/lib/workspace-auth";
import {
  getWorkspaceBusinessSettings,
  updateWorkspaceBusinessSettings,
} from "@/services/workspace/workspace-settings.service";

export async function GET() {
  try {
    const { workspaceId } = await getRequiredWorkspaceManagerContext();
    const settings = await getWorkspaceBusinessSettings(workspaceId);

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { workspaceId } = await getRequiredWorkspaceManagerContext();
    const payload = await request.json().catch(() => null);
    const response = await updateWorkspaceBusinessSettings(
      workspaceId,
      payload,
    );

    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
