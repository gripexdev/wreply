export const messageLogDirectionOptions = [
  { value: "all", label: "All messages" },
  { value: "inbound", label: "Received only" },
  { value: "outbound", label: "Replies only" },
] as const;

export const messageLogOutcomeOptions = [
  { value: "all", label: "All outcomes" },
  { value: "matched", label: "Matched" },
  { value: "unmatched", label: "Unmatched" },
] as const;

export const messageLogSendStatusOptions = [
  { value: "all", label: "All reply statuses" },
  { value: "PREPARED", label: "Prepared" },
  { value: "SENT", label: "Sent" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
] as const;

export const messageLogFallbackOptions = [
  { value: "all", label: "Any default reply" },
  { value: "used", label: "Default reply used" },
  { value: "not_used", label: "No default reply" },
] as const;

export const messageLogDateRangeOptions = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
] as const;
