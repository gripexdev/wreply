export type RuleMatchType = "EXACT" | "CONTAINS";
export type RuleLanguage = "ANY" | "DARIJA" | "FRENCH";
export type RuleStatusFilter = "all" | "active" | "inactive";

export interface RuleListItem {
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

export interface RulesQueryState {
  search: string;
  status: RuleStatusFilter;
  language: "all" | RuleLanguage;
  matchType: "all" | RuleMatchType;
  category: string;
}

export interface RulesSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface RulesListResponse {
  rules: RuleListItem[];
  categories: string[];
  summary: RulesSummary;
  filters: RulesQueryState;
}

export interface RuleMutationResponse {
  message: string;
  rule: RuleListItem;
}

export interface RuleMoveResponse {
  message: string;
}
