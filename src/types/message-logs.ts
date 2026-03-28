export type MessageLogDirection = "INBOUND" | "OUTBOUND";
export type MessageLogDirectionFilter = "all" | "inbound" | "outbound";
export type MessageLogOutcomeFilter = "all" | "matched" | "unmatched";
export type MessageLogSendStatusFilter =
  | "all"
  | "PREPARED"
  | "SENT"
  | "DELIVERED"
  | "FAILED";
export type MessageLogFallbackFilter = "all" | "used" | "not_used";
export type MessageLogDateRangeFilter = "all" | "24h" | "7d" | "30d";
export type OutboundReplySource = "RULE_MATCH" | "FALLBACK";

export interface MessageLogsQueryState {
  search: string;
  direction: MessageLogDirectionFilter;
  outcome: MessageLogOutcomeFilter;
  sendStatus: MessageLogSendStatusFilter;
  fallback: MessageLogFallbackFilter;
  dateRange: MessageLogDateRangeFilter;
}

export interface RelatedMessageSummary {
  id: string;
  direction: MessageLogDirection;
  content: string | null;
  contentPreview: string;
  timestamp: string;
  status: string | null;
  matchedRuleKeyword: string | null;
  fallbackUsed: boolean | null;
  replySource: OutboundReplySource | null;
}

export interface MessageLogListItem {
  id: string;
  direction: MessageLogDirection;
  timestamp: string;
  contactName: string | null;
  contactPhone: string;
  content: string | null;
  contentPreview: string;
  matched: boolean | null;
  matchedRule: {
    id: string;
    keyword: string;
  } | null;
  processingStatus: string | null;
  processingReason: string | null;
  normalizedContent: string | null;
  fallbackEligible: boolean | null;
  fallbackUsed: boolean | null;
  sendStatus: string | null;
  replySource: OutboundReplySource | null;
  failureReason: string | null;
  providerMessageId: string | null;
  relatedMessage: RelatedMessageSummary | null;
}

export interface MessageLogsSummary {
  total: number;
  inbound: number;
  outbound: number;
  matchedInbound: number;
  fallbackReplies: number;
  failedReplies: number;
}

export interface MessageLogsListResponse {
  logs: MessageLogListItem[];
  summary: MessageLogsSummary;
  filters: MessageLogsQueryState;
}

