import { z } from "zod";

const optionalWebsiteUrlSchema = z
  .string()
  .trim()
  .max(2048, "Website URL is too long.")
  .refine((value) => !value || URL.canParse(value), {
    message: "Enter a valid website URL.",
  })
  .transform((value) => value || null)
  .nullable()
  .optional();

const optionalKnowledgeSchema = z
  .string()
  .trim()
  .max(16000, "Business info must be 16000 characters or fewer.")
  .transform((value) => value || null)
  .nullable()
  .optional();

export const updateWorkspaceAssistantSettingsSchema = z.object({
  websiteUrl: optionalWebsiteUrlSchema,
  manualKnowledge: optionalKnowledgeSchema,
});

export type UpdateWorkspaceAssistantSettingsInput = z.input<
  typeof updateWorkspaceAssistantSettingsSchema
>;
