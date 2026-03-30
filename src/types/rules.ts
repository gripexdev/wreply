export type RuleMatchType = "EXACT" | "CONTAINS";
export type RuleLanguage = "ANY" | "DARIJA" | "FRENCH";
export type RuleStatusFilter = "all" | "active" | "inactive";
export type RulePageSize = 25 | 50 | 100;
export type RuleSortOption =
  | "priority_asc"
  | "updated_desc"
  | "keyword_asc"
  | "keyword_desc";

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
  sort: RuleSortOption;
  page: number;
  pageSize: RulePageSize;
}

export interface RulesSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface RulesPagination {
  page: number;
  pageSize: RulePageSize;
  totalItems: number;
  totalPages: number;
  startItem: number;
  endItem: number;
}

export interface RulesListResponse {
  rules: RuleListItem[];
  categories: string[];
  summary: RulesSummary;
  filters: RulesQueryState;
  pagination: RulesPagination;
}

export interface RuleMutationResponse {
  message: string;
  rule: RuleListItem;
}

export interface RuleMoveResponse {
  message: string;
}
