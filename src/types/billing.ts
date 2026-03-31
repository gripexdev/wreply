export type BillingInterval = "MONTHLY" | "YEARLY";

export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";

export interface BillingPlanView {
  id: string;
  slug: string;
  name: string;
  description: string;
  monthlyPriceMad: number;
  yearlyPriceMad: number | null;
  maxRules: number;
  maxMonthlyMessages: number;
  maxWhatsAppConnections: number;
  isCurrent: boolean;
  monthlyAvailable: boolean;
  yearlyAvailable: boolean;
}

export interface BillingSubscriptionView {
  id: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval | null;
  startsAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  plan: {
    id: string;
    slug: string;
    name: string;
    monthlyPriceMad: number;
    yearlyPriceMad: number | null;
  };
}

export interface BillingUsageView {
  periodStart: string;
  periodEnd: string | null;
  rulesUsed: number;
  rulesLimit: number;
  messagesUsed: number;
  messagesLimit: number;
  connectionsUsed: number;
  connectionsLimit: number;
}

export interface BillingOverviewView {
  businessName: string;
  ownerEmail: string;
  stripeReady: boolean;
  webhookReady: boolean;
  canOpenPortal: boolean;
  currentSubscription: BillingSubscriptionView | null;
  usage: BillingUsageView | null;
  plans: BillingPlanView[];
}

export interface BillingCheckoutResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}
