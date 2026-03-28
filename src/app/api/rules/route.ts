import { NextRequest, NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/api-errors";
import { getRequiredWorkspaceContext } from "@/lib/workspace-auth";
import {
  createWorkspaceRule,
  listWorkspaceRules,
} from "@/services/rules/rule.service";

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await getRequiredWorkspaceContext();
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const response = await listWorkspaceRules(workspaceId, query);

    return NextResponse.json(response);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await getRequiredWorkspaceContext();
    const payload = await request.json();
    const rule = await createWorkspaceRule(workspaceId, payload);

    return NextResponse.json(
      {
        message: "Rule created successfully.",
        rule,
      },
      { status: 201 },
    );
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
