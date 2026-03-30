import OpenAI from "openai";

import { env } from "@/config/env";
import {
  AI_SAFE_FALLBACK_REPLY,
  buildAssistantPrompt,
} from "@/lib/assistant/prompt";
import { getWorkspaceAssistantContext } from "@/services/assistant/assistant-knowledge.service";
import type { WorkspaceAssistantReplyResult } from "@/types/assistant";

let openAiClient: OpenAI | null = null;

function getOpenAiClient() {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  openAiClient ??= new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  return openAiClient;
}

function normalizeAiReply(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function hasAssistantKnowledge(
  context: Awaited<ReturnType<typeof getWorkspaceAssistantContext>>,
) {
  return Boolean(
    context.manualKnowledge?.trim() || context.websiteContent?.trim(),
  );
}

function shouldUseSafeFallback(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return (
    !normalizedValue ||
    normalizedValue === AI_SAFE_FALLBACK_REPLY.toLowerCase() ||
    normalizedValue.includes("please send more details")
  );
}

export async function generateWorkspaceAssistantReply(input: {
  workspaceId: string;
  customerMessage: string;
}): Promise<WorkspaceAssistantReplyResult> {
  const client = getOpenAiClient();

  if (!client) {
    return {
      usedAiReply: false,
      replyMessage: null,
      usedSafeFallback: false,
      reason: "AI reply skipped because OpenAI is not configured.",
      model: null,
    };
  }

  const context = await getWorkspaceAssistantContext(input.workspaceId);

  if (!hasAssistantKnowledge(context)) {
    return {
      usedAiReply: false,
      replyMessage: null,
      usedSafeFallback: false,
      reason:
        "AI reply skipped because no assistant knowledge has been trained yet.",
      model: null,
    };
  }

  const prompt = buildAssistantPrompt({
    context,
    customerMessage: input.customerMessage,
  });

  try {
    const response = await client.responses.create({
      model: env.OPENAI_MODEL,
      store: false,
      instructions: prompt.instructions,
      input: prompt.input,
      max_output_tokens: 220,
    });
    const rawReply = normalizeAiReply(response.output_text ?? "");
    const usedSafeFallback = shouldUseSafeFallback(rawReply);
    const replyMessage = usedSafeFallback ? AI_SAFE_FALLBACK_REPLY : rawReply;

    return {
      usedAiReply: true,
      replyMessage,
      usedSafeFallback,
      reason: usedSafeFallback
        ? "No rule matched. AI knowledge was not sufficient, so a safe AI fallback reply was used."
        : "No rule matched. An AI knowledge reply was generated from workspace data.",
      model: env.OPENAI_MODEL,
    };
  } catch (error) {
    return {
      usedAiReply: false,
      replyMessage: null,
      usedSafeFallback: false,
      reason:
        error instanceof Error
          ? `AI reply skipped because OpenAI returned an error: ${error.message}`
          : "AI reply skipped because OpenAI returned an unknown error.",
      model: env.OPENAI_MODEL,
    };
  }
}
