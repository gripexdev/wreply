import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceContext } from "@/lib/workspace-auth";
import {
  deleteWorkspaceRule,
  updateWorkspaceRule,
  updateWorkspaceRuleStatus,
} from "@/services/rules/rule.service";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ ruleId: string }> },
) {
  try {
    const { workspaceId } = await getRequiredWorkspaceContext();
    const { ruleId } = await context.params;
    const payload = await request.json();

    if (Object.keys(payload).length === 1 && "isActive" in payload) {
      const rule = await updateWorkspaceRuleStatus(
        workspaceId,
        ruleId,
        payload,
      );

      return NextResponse.json({
        message: rule.isActive
          ? "Rule enabled successfully."
          : "Rule disabled successfully.",
        rule,
      });
    }

    const rule = await updateWorkspaceRule(workspaceId, {
      ...payload,
      id: ruleId,
    });

    return NextResponse.json({
      message: "Rule updated successfully.",
      rule,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ ruleId: string }> },
) {
  try {
    const { workspaceId } = await getRequiredWorkspaceContext();
    const { ruleId } = await context.params;

    await deleteWorkspaceRule(workspaceId, ruleId);

    return NextResponse.json({
      message: "Rule deleted successfully.",
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
