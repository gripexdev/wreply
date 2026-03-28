import type { AnalyticsDateRange } from "@/types/analytics";

export const analyticsRangeOptions: Array<{
  value: AnalyticsDateRange;
  label: string;
}> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export const analyticsRangeLabelMap: Record<AnalyticsDateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};
