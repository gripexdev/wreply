import "server-only";

import type { BillingInterval } from "@/types/billing";
import { env } from "@/config/env";

const stripePriceIdMap = {
  starter: {
    MONTHLY: env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    YEARLY: env.STRIPE_STARTER_YEARLY_PRICE_ID,
  },
  growth: {
    MONTHLY: env.STRIPE_GROWTH_MONTHLY_PRICE_ID,
    YEARLY: env.STRIPE_GROWTH_YEARLY_PRICE_ID,
  },
} as const;

export function getStripePriceIdForPlan(
  planSlug: string,
  interval: BillingInterval,
) {
  const planConfig =
    stripePriceIdMap[planSlug as keyof typeof stripePriceIdMap] ?? null;

  return planConfig?.[interval] ?? null;
}

export function isStripeBillingEnabled() {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function isStripeWebhookEnabled() {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
}

export function isPlanIntervalAvailable(
  planSlug: string,
  interval: BillingInterval,
) {
  return Boolean(getStripePriceIdForPlan(planSlug, interval));
}
