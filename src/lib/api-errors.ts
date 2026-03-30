import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AssistantKnowledgeServiceError } from "@/services/assistant/assistant-knowledge.service";
import {
  WorkspaceAuthorizationError,
  WorkspacePermissionError,
} from "@/lib/workspace-auth";
import { RuleServiceError } from "@/services/rules/rule.service";
import {
  WhatsAppConnectionServiceError,
  WhatsAppWebhookServiceError,
} from "@/services/whatsapp/whatsapp-errors";
import { WorkspaceSettingsServiceError } from "@/services/workspace/workspace-settings.service";

export function createApiErrorResponse(error: unknown) {
  if (error instanceof WorkspaceAuthorizationError) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  if (error instanceof WorkspacePermissionError) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  if (error instanceof ZodError) {
    const flattenedError = error.flatten();

    return NextResponse.json(
      {
        message: "Please fix the highlighted fields.",
        fieldErrors: flattenedError.fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof RuleServiceError) {
    const statusCodeMap = {
      INVALID_INPUT: 400,
      CONFLICT: 409,
      NOT_FOUND: 404,
      INVALID_MOVE: 409,
    } as const;

    return NextResponse.json(
      { message: error.message },
      { status: statusCodeMap[error.code] },
    );
  }

  if (
    error instanceof WhatsAppConnectionServiceError ||
    error instanceof WhatsAppWebhookServiceError
  ) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof WorkspaceSettingsServiceError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof AssistantKnowledgeServiceError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode },
    );
  }

  console.error(error);
  return NextResponse.json(
    { message: "An unexpected error occurred." },
    { status: 500 },
  );
}
