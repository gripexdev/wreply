import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL."),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters."),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, "NEXT_PUBLIC_APP_NAME is required."),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL."),
  STRIPE_SECRET_KEY: optionalNonEmptyString,
  STRIPE_WEBHOOK_SECRET: optionalNonEmptyString,
  STRIPE_STARTER_MONTHLY_PRICE_ID: optionalNonEmptyString,
  STRIPE_STARTER_YEARLY_PRICE_ID: optionalNonEmptyString,
  STRIPE_GROWTH_MONTHLY_PRICE_ID: optionalNonEmptyString,
  STRIPE_GROWTH_YEARLY_PRICE_ID: optionalNonEmptyString,
  OPENAI_API_KEY: optionalNonEmptyString,
  OPENAI_MODEL: optionalNonEmptyString.default("gpt-5.4-mini"),
});

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_STARTER_MONTHLY_PRICE_ID: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
  STRIPE_STARTER_YEARLY_PRICE_ID: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  STRIPE_GROWTH_MONTHLY_PRICE_ID: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID,
  STRIPE_GROWTH_YEARLY_PRICE_ID: process.env.STRIPE_GROWTH_YEARLY_PRICE_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
});

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables",
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
