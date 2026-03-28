import { z } from "zod";

export const analyticsDateRangeSchema = z
  .enum(["7d", "30d", "90d", "all"])
  .default("30d");

export const analyticsQuerySchema = z.object({
  range: analyticsDateRangeSchema.optional().default("30d"),
});

export type AnalyticsQueryInput = z.input<typeof analyticsQuerySchema>;
