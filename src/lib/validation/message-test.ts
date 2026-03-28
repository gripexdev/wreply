import { z } from "zod";

export const testMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "A sample incoming message is required.")
    .max(1200, "Test messages must be 1200 characters or fewer."),
});

export type TestMessageInput = z.input<typeof testMessageSchema>;
