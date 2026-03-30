import type {
  RuleLanguage,
  RuleMatchType,
  RulePageSize,
  RuleSortOption,
  RuleStatusFilter,
} from "@/types/rules";

export const ruleLanguageOptions: Array<{
  value: RuleLanguage;
  label: string;
}> = [
  { value: "ANY", label: "Any" },
  { value: "DARIJA", label: "Darija" },
  { value: "FRENCH", label: "French" },
];

export const ruleMatchTypeOptions: Array<{
  value: RuleMatchType;
  label: string;
}> = [
  { value: "CONTAINS", label: "Contains" },
  { value: "EXACT", label: "Exact" },
];

export const ruleStatusOptions: Array<{
  value: RuleStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const ruleSortOptions: Array<{
  value: RuleSortOption;
  label: string;
}> = [
  { value: "priority_asc", label: "Priority" },
  { value: "updated_desc", label: "Recently updated" },
  { value: "keyword_asc", label: "Keyword A-Z" },
  { value: "keyword_desc", label: "Keyword Z-A" },
];

export const rulePageSizeOptions: Array<{
  value: RulePageSize;
  label: string;
}> = [
  { value: 25, label: "25 / page" },
  { value: 50, label: "50 / page" },
  { value: 100, label: "100 / page" },
];

export const ruleLanguageFilterOptions = [
  { value: "all", label: "All languages" },
  ...ruleLanguageOptions,
] as const;

export const ruleMatchTypeFilterOptions = [
  { value: "all", label: "All match types" },
  ...ruleMatchTypeOptions,
] as const;

const ruleLanguageLabelMap: Record<RuleLanguage, string> = {
  ANY: "Any",
  DARIJA: "Darija",
  FRENCH: "French",
};

const ruleMatchTypeLabelMap: Record<RuleMatchType, string> = {
  CONTAINS: "Contains",
  EXACT: "Exact",
};

export function getRuleLanguageLabel(language: RuleLanguage) {
  return ruleLanguageLabelMap[language];
}

export function getRuleMatchTypeLabel(matchType: RuleMatchType) {
  return ruleMatchTypeLabelMap[matchType];
}
