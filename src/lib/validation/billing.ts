import { z } from "zod";

export const billingIntervalSchema = z.enum(["MONTHLY", "YEARLY"]);

export const createCheckoutSessionSchema = z.object({
  planSlug: z.string().trim().min(1, "Choose a plan."),
  interval: billingIntervalSchema,
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;
