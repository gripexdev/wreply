import { z } from "zod";

import { ruleLanguageSchema } from "@/lib/validation/rules";

const optionalTrimmedString = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .transform((value) => value || null)
    .nullable()
    .optional();

const optionalUrlString = z
  .string()
  .trim()
  .max(2048, "Google Maps link is too long.")
  .refine((value) => !value || URL.canParse(value), {
    message: "Enter a valid Google Maps URL.",
  })
  .transform((value) => value || null)
  .nullable()
  .optional();

export const updateWorkspaceBusinessSettingsSchema = z
  .object({
    businessName: z
      .string()
      .trim()
      .min(2, "Business name is required.")
      .max(80, "Business name must be 80 characters or fewer."),
    replyDisplayName: optionalTrimmedString(
      80,
      "Reply display name must be 80 characters or fewer.",
    ),
    businessPhoneNumber: optionalTrimmedString(
      40,
      "Contact phone number must be 40 characters or fewer.",
    ),
    address: optionalTrimmedString(
      160,
      "Address must be 160 characters or fewer.",
    ),
    googleMapsLink: optionalUrlString,
    workingHours: optionalTrimmedString(
      120,
      "Working hours must be 120 characters or fewer.",
    ),
    languagePreference: ruleLanguageSchema,
    fallbackReplyEnabled: z.coerce.boolean().default(false),
    fallbackReplyMessage: z
      .string()
      .trim()
      .max(1200, "Fallback reply must be 1200 characters or fewer.")
      .transform((value) => value || null)
      .nullable()
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.fallbackReplyEnabled && !value.fallbackReplyMessage) {
      context.addIssue({
        code: "custom",
        message: "Add a default reply before turning this on.",
        path: ["fallbackReplyMessage"],
      });
    }
  });

export type UpdateWorkspaceBusinessSettingsInput = z.input<
  typeof updateWorkspaceBusinessSettingsSchema
>;
