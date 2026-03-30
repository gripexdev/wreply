export type AnalyticsDateRange = "7d" | "30d" | "90d" | "all";

export interface AnalyticsKpis {
  totalIncomingMessages: number;
  matchedMessages: number;
  unmatchedMessages: number;
  matchRate: number;
  fallbackRepliesUsed: number;
  fallbackUsageRate: number;
  outboundPrepared: number;
  outboundSent: number;
  outboundDelivered: number;
  outboundFailed: number;
  activeRules: number;
}

export interface AnalyticsSeriesPoint {
  dateKey: string;
  label: string;
  shortLabel: string;
  incoming: number;
  matched: number;
  unmatched: number;
  fallbackUsed: number;
  prepared: number;
  sent: number;
  delivered: number;
  failed: number;
}

export interface AnalyticsTopRule {
  id: string;
  keyword: string;
  isActive: boolean;
  matchCount: number;
  matchShare: number;
}

export interface AnalyticsDeliveryIssue {
  id: string;
  recipientPhone: string;
  createdAt: string;
  failureReason: string;
  contentPreview: string;
  replySource: "RULE_MATCH" | "AI_KNOWLEDGE" | "FALLBACK" | null;
}

export interface WorkspaceAnalyticsView {
  range: AnalyticsDateRange;
  rangeLabel: string;
  windowLabel: string;
  hasData: boolean;
  kpis: AnalyticsKpis;
  series: AnalyticsSeriesPoint[];
  topRules: AnalyticsTopRule[];
  recentDeliveryIssues: AnalyticsDeliveryIssue[];
}
