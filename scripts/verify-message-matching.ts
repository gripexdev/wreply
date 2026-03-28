import assert from "node:assert/strict";

import { matchMessageAgainstRules } from "../src/lib/messages/match-engine";
import type { MatchEngineRule } from "../src/types/messages";

function createRule(
  overrides: Partial<MatchEngineRule> & Pick<MatchEngineRule, "id" | "keyword">,
): MatchEngineRule {
  return {
    id: overrides.id,
    workspaceId: overrides.workspaceId ?? "workspace-alpha",
    keyword: overrides.keyword,
    replyMessage: overrides.replyMessage ?? `Reply for ${overrides.keyword}`,
    matchType: overrides.matchType ?? "CONTAINS",
    language: overrides.language ?? "ANY",
    category: overrides.category ?? null,
    priority: overrides.priority ?? 1,
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? "2026-03-28T18:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-28T18:00:00.000Z",
  };
}

const workspaceId = "workspace-alpha";

const exactPreferredResult = matchMessageAgainstRules({
  workspaceId,
  message: "PRIX???",
  rules: [
    createRule({
      id: "contains-price",
      keyword: "prix",
      matchType: "CONTAINS",
      priority: 1,
      createdAt: "2026-03-28T18:01:00.000Z",
    }),
    createRule({
      id: "exact-price",
      keyword: "prix",
      matchType: "EXACT",
      priority: 1,
      createdAt: "2026-03-28T18:00:00.000Z",
    }),
  ],
});

assert.equal(exactPreferredResult.matched, true);
assert.equal(exactPreferredResult.matchedRuleId, "exact-price");
assert.equal(exactPreferredResult.normalizedMessage, "prix");

const aliasContainsResult = matchMessageAgainstRules({
  workspaceId,
  message: "chhal taman",
  rules: [
    createRule({
      id: "price-rule",
      keyword: "price",
      priority: 1,
    }),
  ],
});

assert.equal(aliasContainsResult.matched, true);
assert.equal(aliasContainsResult.matchedRuleId, "price-rule");
assert.equal(aliasContainsResult.matchSource, "alias");
assert.equal(aliasContainsResult.matchedAliasFamily, "price");

const inactiveIgnoredResult = matchMessageAgainstRules({
  workspaceId,
  message: "delivery dispo",
  rules: [
    createRule({
      id: "inactive-delivery",
      keyword: "livraison",
      priority: 1,
      isActive: false,
    }),
  ],
});

assert.equal(inactiveIgnoredResult.matched, false);
assert.equal(inactiveIgnoredResult.fallbackEligible, true);

const priorityWinnerResult = matchMessageAgainstRules({
  workspaceId,
  message: "prix",
  rules: [
    createRule({
      id: "priority-first",
      keyword: "price",
      priority: 1,
      matchType: "CONTAINS",
    }),
    createRule({
      id: "priority-second",
      keyword: "prix",
      priority: 2,
      matchType: "EXACT",
    }),
  ],
});

assert.equal(priorityWinnerResult.matched, true);
assert.equal(priorityWinnerResult.matchedRuleId, "priority-first");

const noMatchResult = matchMessageAgainstRules({
  workspaceId,
  message: "bonjour je veux une garantie",
  rules: [
    createRule({
      id: "stock-rule",
      keyword: "stock",
      priority: 1,
    }),
    createRule({
      id: "hours-rule",
      keyword: "horaires",
      priority: 2,
    }),
  ],
});

assert.equal(noMatchResult.matched, false);
assert.equal(noMatchResult.fallbackEligible, true);

const darijaHoursResult = matchMessageAgainstRules({
  workspaceId,
  message: "wa9tاش kat7ello?",
  rules: [
    createRule({
      id: "hours-rule",
      keyword: "horaires",
      priority: 1,
      language: "DARIJA",
    }),
  ],
});

assert.equal(darijaHoursResult.matched, true);
assert.equal(darijaHoursResult.matchedRuleId, "hours-rule");
assert.equal(darijaHoursResult.messageLanguageHint, "darija");

console.log("Message matching verification passed.");
