import type { BillingInterval, SubscriptionStatus } from "@/types/billing";

export const billingIntervals: BillingInterval[] = ["MONTHLY", "YEARLY"];

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  TRIALING: "Trial",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELED: "Canceled",
  EXPIRED: "Expired",
};
