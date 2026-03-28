import { prisma } from "@/database/client";
import { matchMessageAgainstRules } from "@/lib/messages/match-engine";
import {
  testMessageSchema,
  type TestMessageInput,
} from "@/lib/validation/message-test";
import type { MatchEngineRule } from "@/types/messages";

function toMatchEngineRule(
  rule: Awaited<ReturnType<typeof listWorkspaceRulesForMatching>>[number],
): MatchEngineRule {
  return {
    id: rule.id,
    workspaceId: rule.workspaceId,
    keyword: rule.keyword,
    replyMessage: rule.replyMessage,
    matchType: rule.matchType,
    language: rule.language,
    category: rule.category,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}

export async function listWorkspaceRulesForMatching(workspaceId: string) {
  return prisma.autoReplyRule.findMany({
    where: {
      workspaceId,
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });
}

export async function testWorkspaceMessageMatch(
  workspaceId: string,
  rawInput: TestMessageInput,
  rules?: MatchEngineRule[],
) {
  const input = testMessageSchema.parse(rawInput);
  const scopedRules =
    rules?.filter((rule) => rule.workspaceId === workspaceId) ??
    (await listWorkspaceRulesForMatching(workspaceId)).map(toMatchEngineRule);

  return matchMessageAgainstRules({
    workspaceId,
    message: input.message,
    rules: scopedRules,
  });
}
