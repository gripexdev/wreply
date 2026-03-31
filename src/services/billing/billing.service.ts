import {
  BillingInterval as PrismaBillingInterval,
  Prisma,
  SubscriptionStatus as PrismaSubscriptionStatus,
} from "@prisma/client";
import Stripe from "stripe";

import {
  getStripePriceIdForPlan,
  isPlanIntervalAvailable,
  isStripeBillingEnabled,
  isStripeWebhookEnabled,
} from "@/config/billing-server";
import { env } from "@/config/env";
import { prisma } from "@/database/client";
import { getStripeClient } from "@/lib/stripe/client";
import { createCheckoutSessionSchema } from "@/lib/validation/billing";
import type {
  BillingInterval,
  BillingOverviewView,
  BillingSubscriptionView,
} from "@/types/billing";

const manageableStatuses = new Set<PrismaSubscriptionStatus>([
  PrismaSubscriptionStatus.TRIALING,
  PrismaSubscriptionStatus.ACTIVE,
  PrismaSubscriptionStatus.PAST_DUE,
]);

type SubscriptionRecord = Prisma.SubscriptionGetPayload<{
  include: {
    plan: {
      select: {
        id: true;
        slug: true;
        name: true;
        monthlyPriceMad: true;
        yearlyPriceMad: true;
        maxRules: true;
        maxMonthlyMessages: true;
        maxWhatsAppConnections: true;
      };
    };
  };
}>;

type WorkspaceBillingRecord = Prisma.WorkspaceGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    billingCustomerId: true;
    owner: {
      select: {
        email: true;
      };
    };
  };
}>;

export class BillingServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "BillingServiceError";
  }
}

function getActiveSubscription<T extends { status: PrismaSubscriptionStatus }>(
  subscriptions: T[],
) {
  return (
    subscriptions.find((subscription) =>
      manageableStatuses.has(subscription.status),
    ) ??
    subscriptions[0] ??
    null
  );
}

function toIso(date: Date | null | undefined) {
  return date ? date.toISOString() : null;
}

function subtractDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);

  return date;
}

function mapSubscriptionStatus(
  status: Stripe.Subscription.Status,
): PrismaSubscriptionStatus {
  switch (status) {
    case "trialing":
      return PrismaSubscriptionStatus.TRIALING;
    case "active":
      return PrismaSubscriptionStatus.ACTIVE;
    case "canceled":
      return PrismaSubscriptionStatus.CANCELED;
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return PrismaSubscriptionStatus.PAST_DUE;
    default:
      return PrismaSubscriptionStatus.EXPIRED;
  }
}

function mapBillingInterval(
  value: PrismaBillingInterval | null | undefined,
): BillingInterval | null {
  if (!value) {
    return null;
  }

  return value;
}

function fromUnixTimestamp(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

function deriveIntervalFromPriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }

  const planSlugs = ["starter", "growth"] as const;

  for (const slug of planSlugs) {
    if (getStripePriceIdForPlan(slug, "MONTHLY") === priceId) {
      return PrismaBillingInterval.MONTHLY;
    }

    if (getStripePriceIdForPlan(slug, "YEARLY") === priceId) {
      return PrismaBillingInterval.YEARLY;
    }
  }

  return null;
}

async function getWorkspaceBillingRecord(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      slug: true,
      billingCustomerId: true,
      owner: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new BillingServiceError("Business not found.", 404);
  }

  return workspace;
}

async function getWorkspaceCustomerId(
  workspace: WorkspaceBillingRecord,
  stripe: Stripe,
) {
  if (workspace.billingCustomerId) {
    return workspace.billingCustomerId;
  }

  const latestSubscription = await prisma.subscription.findFirst({
    where: {
      workspaceId: workspace.id,
      providerCustomerId: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      providerCustomerId: true,
    },
  });

  if (latestSubscription?.providerCustomerId) {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        billingCustomerId: latestSubscription.providerCustomerId,
      },
    });

    return latestSubscription.providerCustomerId;
  }

  const customer = await stripe.customers.create({
    email: workspace.owner.email,
    name: workspace.name,
    metadata: {
      workspaceId: workspace.id,
      workspaceSlug: workspace.slug,
    },
  });

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      billingCustomerId: customer.id,
    },
  });

  return customer.id;
}

function toBillingSubscriptionView(
  subscription: SubscriptionRecord | null,
): BillingSubscriptionView | null {
  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    status: subscription.status,
    billingInterval: mapBillingInterval(subscription.billingInterval),
    startsAt: subscription.startsAt.toISOString(),
    currentPeriodStart: toIso(subscription.currentPeriodStart),
    currentPeriodEnd: toIso(subscription.currentPeriodEnd),
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    canceledAt: toIso(subscription.canceledAt),
    plan: {
      id: subscription.plan.id,
      slug: subscription.plan.slug,
      name: subscription.plan.name,
      monthlyPriceMad: subscription.plan.monthlyPriceMad,
      yearlyPriceMad: subscription.plan.yearlyPriceMad,
    },
  };
}

async function resolvePlanByPriceId(priceId: string) {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      monthlyPriceMad: true,
      yearlyPriceMad: true,
      maxRules: true,
      maxMonthlyMessages: true,
      maxWhatsAppConnections: true,
    },
  });

  const plan = plans.find(
    (currentPlan) =>
      getStripePriceIdForPlan(currentPlan.slug, "MONTHLY") === priceId ||
      getStripePriceIdForPlan(currentPlan.slug, "YEARLY") === priceId,
  );

  if (!plan) {
    throw new BillingServiceError("Stripe plan mapping is missing.", 400);
  }

  return plan;
}

async function resolveWorkspaceForStripeEvent(params: {
  workspaceId?: string | null;
  customerId?: string | null;
}) {
  if (params.workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { id: true },
    });

    if (workspace) {
      return workspace;
    }
  }

  if (params.customerId) {
    return prisma.workspace.findFirst({
      where: { billingCustomerId: params.customerId },
      select: { id: true },
    });
  }

  return null;
}

async function upsertSubscriptionFromStripeSubscription(
  stripeSubscription: Stripe.Subscription,
  fallbackWorkspaceId?: string | null,
) {
  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;
  const primaryItem = stripeSubscription.items.data[0] ?? null;
  const priceId = stripeSubscription.items.data[0]?.price?.id ?? null;

  if (!customerId || !priceId) {
    throw new BillingServiceError(
      "Stripe subscription payload is missing customer or price data.",
      400,
    );
  }

  const workspace = await resolveWorkspaceForStripeEvent({
    workspaceId: stripeSubscription.metadata.workspaceId ?? fallbackWorkspaceId,
    customerId,
  });

  if (!workspace) {
    throw new BillingServiceError("Business not found for Stripe event.", 404);
  }

  const plan = await resolvePlanByPriceId(priceId);
  const billingInterval =
    deriveIntervalFromPriceId(priceId) ??
    (stripeSubscription.metadata.billingInterval === "YEARLY"
      ? PrismaBillingInterval.YEARLY
      : stripeSubscription.metadata.billingInterval === "MONTHLY"
        ? PrismaBillingInterval.MONTHLY
        : null);

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      billingCustomerId: customerId,
    },
  });

  await prisma.subscription.upsert({
    where: {
      providerSubscriptionId: stripeSubscription.id,
    },
    update: {
      workspaceId: workspace.id,
      planId: plan.id,
      status: mapSubscriptionStatus(stripeSubscription.status),
      billingInterval,
      startsAt: fromUnixTimestamp(stripeSubscription.start_date) ?? new Date(),
      currentPeriodStart: fromUnixTimestamp(primaryItem?.current_period_start),
      currentPeriodEnd: fromUnixTimestamp(primaryItem?.current_period_end),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: fromUnixTimestamp(stripeSubscription.canceled_at),
      providerCustomerId: customerId,
      providerPriceId: priceId,
    },
    create: {
      workspaceId: workspace.id,
      planId: plan.id,
      status: mapSubscriptionStatus(stripeSubscription.status),
      billingInterval,
      startsAt: fromUnixTimestamp(stripeSubscription.start_date) ?? new Date(),
      currentPeriodStart: fromUnixTimestamp(primaryItem?.current_period_start),
      currentPeriodEnd: fromUnixTimestamp(primaryItem?.current_period_end),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: fromUnixTimestamp(stripeSubscription.canceled_at),
      providerCustomerId: customerId,
      providerPriceId: priceId,
      providerSubscriptionId: stripeSubscription.id,
    },
  });
}

export async function getBillingOverview(
  workspaceId: string,
): Promise<BillingOverviewView> {
  const [workspace, plans, subscriptions, rulesUsed, connectionsUsed] =
    await Promise.all([
      getWorkspaceBillingRecord(workspaceId),
      prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { monthlyPriceMad: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          monthlyPriceMad: true,
          yearlyPriceMad: true,
          maxRules: true,
          maxMonthlyMessages: true,
          maxWhatsAppConnections: true,
        },
      }),
      prisma.subscription.findMany({
        where: { workspaceId },
        include: {
          plan: {
            select: {
              id: true,
              slug: true,
              name: true,
              monthlyPriceMad: true,
              yearlyPriceMad: true,
              maxRules: true,
              maxMonthlyMessages: true,
              maxWhatsAppConnections: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.autoReplyRule.count({
        where: { workspaceId, isActive: true },
      }),
      prisma.whatsAppConnection.count({
        where: { workspaceId },
      }),
    ]);

  const currentSubscription = getActiveSubscription(subscriptions);
  const periodStart =
    currentSubscription?.currentPeriodStart ?? subtractDays(30);
  const periodEnd = currentSubscription?.currentPeriodEnd ?? null;
  const messagesUsed = await prisma.incomingMessageLog.count({
    where: {
      workspaceId,
      receivedAt: { gte: periodStart },
    },
  });

  return {
    businessName: workspace.name,
    ownerEmail: workspace.owner.email,
    stripeReady: isStripeBillingEnabled(),
    webhookReady: isStripeWebhookEnabled(),
    canOpenPortal: Boolean(
      isStripeBillingEnabled() && workspace.billingCustomerId,
    ),
    currentSubscription: toBillingSubscriptionView(currentSubscription),
    usage: currentSubscription
      ? {
          periodStart: periodStart.toISOString(),
          periodEnd: toIso(periodEnd),
          rulesUsed,
          rulesLimit: currentSubscription.plan.maxRules,
          messagesUsed,
          messagesLimit: currentSubscription.plan.maxMonthlyMessages,
          connectionsUsed,
          connectionsLimit: currentSubscription.plan.maxWhatsAppConnections,
        }
      : null,
    plans: plans.map((plan) => ({
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      description: plan.description ?? "",
      monthlyPriceMad: plan.monthlyPriceMad,
      yearlyPriceMad: plan.yearlyPriceMad,
      maxRules: plan.maxRules,
      maxMonthlyMessages: plan.maxMonthlyMessages,
      maxWhatsAppConnections: plan.maxWhatsAppConnections,
      isCurrent: currentSubscription?.planId === plan.id,
      monthlyAvailable: isPlanIntervalAvailable(plan.slug, "MONTHLY"),
      yearlyAvailable:
        Boolean(plan.yearlyPriceMad) &&
        isPlanIntervalAvailable(plan.slug, "YEARLY"),
    })),
  };
}

export async function createCheckoutSessionForWorkspace(params: {
  workspaceId: string;
  planSlug: string;
  interval: BillingInterval;
}) {
  const input = createCheckoutSessionSchema.parse({
    planSlug: params.planSlug,
    interval: params.interval,
  });
  const stripe = getStripeClient();
  const workspace = await getWorkspaceBillingRecord(params.workspaceId);
  const existingSubscriptions = await prisma.subscription.findMany({
    where: { workspaceId: params.workspaceId },
    include: {
      plan: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
  const currentSubscription = getActiveSubscription(existingSubscriptions);

  if (currentSubscription) {
    throw new BillingServiceError(
      "Manage your current plan from billing.",
      409,
    );
  }

  const plan = await prisma.plan.findUnique({
    where: { slug: input.planSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      isActive: true,
    },
  });

  if (!plan?.isActive) {
    throw new BillingServiceError("Plan not found.", 404);
  }

  const priceId = getStripePriceIdForPlan(plan.slug, input.interval);

  if (!priceId) {
    throw new BillingServiceError(
      "This plan is not ready for checkout yet.",
      503,
    );
  }

  const customerId = await getWorkspaceCustomerId(workspace, stripe);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: workspace.id,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=canceled`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    locale: "auto",
    metadata: {
      workspaceId: workspace.id,
      planSlug: plan.slug,
      billingInterval: input.interval,
    },
    subscription_data: {
      metadata: {
        workspaceId: workspace.id,
        planSlug: plan.slug,
        billingInterval: input.interval,
      },
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
  });

  if (!session.url) {
    throw new BillingServiceError(
      "Stripe did not return a checkout link.",
      502,
    );
  }

  return {
    url: session.url,
  };
}

export async function createBillingPortalSession(workspaceId: string) {
  if (!isStripeBillingEnabled()) {
    throw new BillingServiceError("Billing is not connected yet.", 503);
  }

  const stripe = getStripeClient();
  const workspace = await getWorkspaceBillingRecord(workspaceId);
  const customerId = await getWorkspaceCustomerId(workspace, stripe);
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return {
    url: session.url,
  };
}

export async function handleStripeWebhook(rawBody: string, signature: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new BillingServiceError(
      "Stripe webhook signing secret is missing.",
      503,
    );
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw new BillingServiceError("Invalid Stripe signature.", 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (session.mode === "subscription" && session.subscription) {
        const workspaceId =
          session.metadata?.workspaceId ?? session.client_reference_id ?? null;

        if (workspaceId && customerId) {
          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              billingCustomerId: customerId,
            },
          });
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const stripeSubscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await upsertSubscriptionFromStripeSubscription(
          stripeSubscription,
          workspaceId,
        );
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripeSubscription(stripeSubscription);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id;

      if (subscriptionId) {
        await prisma.subscription.updateMany({
          where: { providerSubscriptionId: subscriptionId },
          data: { status: PrismaSubscriptionStatus.PAST_DUE },
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id;

      if (subscriptionId) {
        await prisma.subscription.updateMany({
          where: { providerSubscriptionId: subscriptionId },
          data: { status: PrismaSubscriptionStatus.ACTIVE },
        });
      }
      break;
    }

    default:
      break;
  }

  return {
    received: true,
    type: event.type,
  };
}
