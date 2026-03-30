import { z } from "zod";

const keywordSchema = z
  .string()
  .trim()
  .min(1, "Keyword or phrase is required.")
  .max(120, "Keyword or phrase must be 120 characters or fewer.");

const replyMessageSchema = z
  .string()
  .trim()
  .min(1, "Reply message is required.")
  .max(1200, "Reply message must be 1200 characters or fewer.");

const categorySchema = z
  .string()
  .trim()
  .max(48, "Category must be 48 characters or fewer.")
  .transform((value) => value || null)
  .nullable()
  .optional();

export const ruleMatchTypeSchema = z.enum(["EXACT", "CONTAINS"]);
export const ruleLanguageSchema = z.enum(["ANY", "DARIJA", "FRENCH"]);
export const ruleStatusFilterSchema = z.enum(["all", "active", "inactive"]);
export const ruleSortSchema = z.enum([
  "priority_asc",
  "updated_desc",
  "keyword_asc",
  "keyword_desc",
]);

export const createRuleSchema = z.object({
  keyword: keywordSchema,
  replyMessage: replyMessageSchema,
  matchType: ruleMatchTypeSchema,
  language: ruleLanguageSchema,
  category: categorySchema,
  priority: z.coerce
    .number()
    .int("Priority must be a whole number.")
    .min(1, "Priority must be at least 1.")
    .max(500, "Priority must be 500 or fewer."),
  isActive: z.coerce.boolean(),
});

export const updateRuleSchema = createRuleSchema.extend({
  id: z.string().min(1, "Rule id is required."),
});

export const updateRuleStatusSchema = z.object({
  isActive: z.coerce.boolean(),
});

export const moveRuleSchema = z.object({
  direction: z.enum(["up", "down"]),
});

export const rulesQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, "Search query is too long.")
    .optional()
    .default(""),
  status: ruleStatusFilterSchema.optional().default("all"),
  language: z
    .enum(["all", "ANY", "DARIJA", "FRENCH"])
    .optional()
    .default("all"),
  matchType: z.enum(["all", "EXACT", "CONTAINS"]).optional().default("all"),
  category: z
    .string()
    .trim()
    .max(48, "Category filter is too long.")
    .optional()
    .default(""),
  sort: ruleSortSchema.optional().default("priority_asc"),
  page: z.coerce
    .number()
    .int("Page must be a whole number.")
    .min(1, "Page must be at least 1.")
    .optional()
    .default(1),
  pageSize: z.coerce
    .number()
    .int("Page size must be a whole number.")
    .refine((value) => [25, 50, 100].includes(value), {
      message: "Page size must be 25, 50, or 100.",
    })
    .transform((value) => value as 25 | 50 | 100)
    .optional()
    .default(25),
});

export type CreateRuleInput = z.input<typeof createRuleSchema>;
export type UpdateRuleInput = z.input<typeof updateRuleSchema>;
export type UpdateRuleStatusInput = z.input<typeof updateRuleStatusSchema>;
export type MoveRuleInput = z.input<typeof moveRuleSchema>;
export type RulesQueryInput = z.input<typeof rulesQuerySchema>;
