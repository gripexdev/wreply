import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceOwnerContext } from "@/lib/workspace-auth";
import {
  getWorkspaceWhatsAppConnectionSettings,
  upsertWorkspaceWhatsAppConnection,
} from "@/services/whatsapp/whatsapp-connection.service";

export async function GET() {
  try {
    const { workspaceId } = await getRequiredWorkspaceOwnerContext();
    const connection = await getWorkspaceWhatsAppConnectionSettings(workspaceId);

    return NextResponse.json({
      connection,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { workspaceId } = await getRequiredWorkspaceOwnerContext();
    const payload = await request.json().catch(() => null);
    const response = await upsertWorkspaceWhatsAppConnection(workspaceId, payload);

    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
