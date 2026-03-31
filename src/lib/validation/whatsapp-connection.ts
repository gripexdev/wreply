import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .max(255, "Value is too long.")
  .transform((value) => value || null)
  .nullable()
  .optional();

export const updateWhatsAppConnectionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Line name is required.")
    .max(80, "Line name must be 80 characters or fewer."),
  phoneNumber: optionalTrimmedString,
  phoneNumberId: optionalTrimmedString,
  businessAccountId: optionalTrimmedString,
  accessToken: z
    .string()
    .trim()
    .max(2048, "Access token is too long.")
    .transform((value) => value || null)
    .nullable()
    .optional(),
  verifyToken: z
    .string()
    .trim()
    .max(255, "Verification token is too long.")
    .transform((value) => value || null)
    .nullable()
    .optional(),
  appSecret: z
    .string()
    .trim()
    .max(255, "App secret is too long.")
    .transform((value) => value || null)
    .nullable()
    .optional(),
  webhookSubscribed: z.coerce.boolean().default(false),
  sendRepliesEnabled: z.coerce.boolean().default(false),
});

export type UpdateWhatsAppConnectionInput = z.input<
  typeof updateWhatsAppConnectionSchema
>;
