import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceOwnerContext } from "@/lib/workspace-auth";
import { createBillingPortalSession } from "@/services/billing/billing.service";

export async function POST() {
  try {
    const { workspaceId } = await getRequiredWorkspaceOwnerContext();
    const response = await createBillingPortalSession(workspaceId);

    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
