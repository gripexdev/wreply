import { z } from "zod";

const emailSchema = z.string().trim().email().max(120);
const passwordSchema = z.string().min(8).max(72);

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  workspaceName: z.string().trim().min(2).max(80).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
