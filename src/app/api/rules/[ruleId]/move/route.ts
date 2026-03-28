import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceContext } from "@/lib/workspace-auth";
import { moveWorkspaceRule } from "@/services/rules/rule.service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ ruleId: string }> },
) {
  try {
    const { workspaceId } = await getRequiredWorkspaceContext();
    const { ruleId } = await context.params;
    const payload = await request.json();

    await moveWorkspaceRule(workspaceId, ruleId, payload);

    return NextResponse.json({
      message: "Rule priority updated successfully.",
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
