export const messageLogDirectionOptions = [
  { value: "all", label: "All directions" },
  { value: "inbound", label: "Inbound only" },
  { value: "outbound", label: "Outbound only" },
] as const;

export const messageLogOutcomeOptions = [
  { value: "all", label: "All outcomes" },
  { value: "matched", label: "Matched" },
  { value: "unmatched", label: "Unmatched" },
] as const;

export const messageLogSendStatusOptions = [
  { value: "all", label: "All send states" },
  { value: "PREPARED", label: "Prepared" },
  { value: "SENT", label: "Sent" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
] as const;

export const messageLogFallbackOptions = [
  { value: "all", label: "Fallback any" },
  { value: "used", label: "Fallback used" },
  { value: "not_used", label: "No fallback" },
] as const;

export const messageLogDateRangeOptions = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
] as const;
