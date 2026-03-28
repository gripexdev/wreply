import type { RuleLanguage, RuleMatchType } from "@/types/rules";

export type MessageLanguageHint = "darija" | "french" | "mixed" | "neutral";
export type MatchSource = "keyword" | "alias";

export interface MatchEngineRule {
  id: string;
  workspaceId: string;
  keyword: string;
  replyMessage: string;
  matchType: RuleMatchType;
  language: RuleLanguage;
  category: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MatchedRuleSnapshot {
  id: string;
  keyword: string;
  replyMessage: string;
  matchType: RuleMatchType;
  language: RuleLanguage;
  category: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageMatchResult {
  workspaceId: string;
  rawMessage: string;
  normalizedMessage: string;
  matched: boolean;
  matchedRuleId: string | null;
  matchedRule: MatchedRuleSnapshot | null;
  matchedKeyword: string | null;
  matchTypeUsed: RuleMatchType | null;
  matchedTextFragment: string | null;
  matchedAlias: string | null;
  matchedAliasFamily: string | null;
  matchSource: MatchSource | null;
  score: number | null;
  reason: string;
  fallbackEligible: boolean;
  messageLanguageHint: MessageLanguageHint;
  evaluatedRulesCount: number;
  eligibleRulesCount: number;
}

export interface TestMessageMatchResponse {
  result: MessageMatchResult;
}
