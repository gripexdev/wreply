import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceOwnerContext } from "@/lib/workspace-auth";
import { createCheckoutSessionForWorkspace } from "@/services/billing/billing.service";

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await getRequiredWorkspaceOwnerContext();
    const payload = await request.json().catch(() => null);
    const response = await createCheckoutSessionForWorkspace({
      workspaceId,
      ...(payload ?? {}),
    });

    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
