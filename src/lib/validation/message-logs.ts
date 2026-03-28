import { z } from "zod";

export const messageLogDirectionFilterSchema = z.enum([
  "all",
  "inbound",
  "outbound",
]);
export const messageLogOutcomeFilterSchema = z.enum([
  "all",
  "matched",
  "unmatched",
]);
export const messageLogSendStatusFilterSchema = z.enum([
  "all",
  "PREPARED",
  "SENT",
  "DELIVERED",
  "FAILED",
]);
export const messageLogFallbackFilterSchema = z.enum([
  "all",
  "used",
  "not_used",
]);
export const messageLogDateRangeFilterSchema = z.enum([
  "all",
  "24h",
  "7d",
  "30d",
]);

export const messageLogsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, "Search query is too long.")
    .optional()
    .default(""),
  direction: messageLogDirectionFilterSchema.optional().default("all"),
  outcome: messageLogOutcomeFilterSchema.optional().default("all"),
  sendStatus: messageLogSendStatusFilterSchema.optional().default("all"),
  fallback: messageLogFallbackFilterSchema.optional().default("all"),
  dateRange: messageLogDateRangeFilterSchema.optional().default("all"),
});

export type MessageLogsQueryInput = z.input<typeof messageLogsQuerySchema>;
