"use client";

import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { billingIntervals, subscriptionStatusLabels } from "@/config/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { cn, formatCurrencyMad, formatShortDate } from "@/lib/utils";
import type {
  BillingCheckoutResponse,
  BillingInterval,
  BillingOverviewView,
  BillingPortalResponse,
} from "@/types/billing";

function UsageBar({
  label,
  used,
  limit,
}: Readonly<{
  label: string;
  used: number;
  limit: number;
}>) {
  const ratio = Math.min(limit === 0 ? 0 : used / limit, 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-white/74">{label}</span>
        <span className="font-medium text-white">
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#3B82F6_0%,#22D3EE_60%,#A855F7_100%)] transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function readJson<T>(response: Response) {
  return response.json().catch(() => null) as Promise<T | null>;
}

export function BillingPageClient({
  overview,
}: Readonly<{
  overview: BillingOverviewView;
}>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>("MONTHLY");
  const [checkoutPlanSlug, setCheckoutPlanSlug] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    const checkoutState = searchParams.get("checkout");

    if (!checkoutState) {
      return;
    }

    if (checkoutState === "success") {
      pushToast({
        variant: "success",
        title: "Checkout complete",
        description: "Billing is updating now.",
      });
    }

    if (checkoutState === "canceled") {
      pushToast({
        variant: "info",
        title: "Checkout canceled",
        description: "No changes were made.",
      });
    }

    router.replace("/dashboard/billing", { scroll: false });
  }, [pushToast, router, searchParams]);

  const currentPlanSlug = overview.currentSubscription?.plan.slug ?? null;
  const currentStatus = overview.currentSubscription
    ? subscriptionStatusLabels[overview.currentSubscription.status]
    : "No active plan";
  const canUsePortalForChanges = Boolean(
    overview.currentSubscription && overview.canOpenPortal,
  );

  const periodPriceLabel = useMemo(() => {
    if (!overview.currentSubscription) {
      return "Choose a plan";
    }

    const amount =
      overview.currentSubscription.billingInterval === "YEARLY" &&
      overview.currentSubscription.plan.yearlyPriceMad
        ? overview.currentSubscription.plan.yearlyPriceMad
        : overview.currentSubscription.plan.monthlyPriceMad;
    const suffix =
      overview.currentSubscription.billingInterval === "YEARLY"
        ? "/ year"
        : "/ month";

    return `${formatCurrencyMad(amount)} ${suffix}`;
  }, [overview.currentSubscription]);

  async function handleCheckout(planSlug: string) {
    setCheckoutPlanSlug(planSlug);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planSlug,
          interval: selectedInterval,
        }),
      });
      const payload = await readJson<
        BillingCheckoutResponse & { message?: string }
      >(response);

      if (!response.ok || !payload?.url) {
        pushToast({
          variant: "error",
          title: "Could not open checkout",
          description: payload?.message ?? "Please try again.",
        });
        return;
      }

      window.location.assign(payload.url);
    } catch {
      pushToast({
        variant: "error",
        title: "Could not open checkout",
        description: "Please try again.",
      });
    } finally {
      setCheckoutPlanSlug(null);
    }
  }

  async function handleOpenPortal() {
    setIsOpeningPortal(true);

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const payload = await readJson<
        BillingPortalResponse & { message?: string }
      >(response);

      if (!response.ok || !payload?.url) {
        pushToast({
          variant: "error",
          title: "Could not open billing",
          description: payload?.message ?? "Please try again.",
        });
        return;
      }

      window.location.assign(payload.url);
    } catch {
      pushToast({
        variant: "error",
        title: "Could not open billing",
        description: "Please try again.",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Billing
                </Badge>
                <h1 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  Plans and payments
                </h1>
                <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                  Manage your plan, renewals, and billing access.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-white/10 bg-white/[0.03] text-white">
                  {currentStatus}
                </Badge>
                {overview.currentSubscription?.billingInterval ? (
                  <Badge className="border-white/10 bg-white/[0.03] text-white">
                    {overview.currentSubscription.billingInterval === "YEARLY"
                      ? "Yearly"
                      : "Monthly"}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                  Current plan
                </p>
                <p className="font-display mt-3 text-3xl font-semibold text-white">
                  {overview.currentSubscription?.plan.name ?? "No plan"}
                </p>
                <p className="mt-1 text-xs text-white/42">{periodPriceLabel}</p>
              </div>

              <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                  Renewal
                </p>
                <p className="mt-3 text-sm font-semibold text-white">
                  {overview.currentSubscription?.currentPeriodEnd
                    ? formatShortDate(
                        overview.currentSubscription.currentPeriodEnd,
                      )
                    : "Not scheduled"}
                </p>
                <p className="mt-1 text-xs text-white/42">
                  {overview.currentSubscription?.cancelAtPeriodEnd
                    ? "Ends at the close of this period."
                    : "Your plan renews automatically."}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                  Billing access
                </p>
                <p className="mt-3 text-sm font-semibold text-white">
                  {overview.ownerEmail}
                </p>
                <p className="mt-1 text-xs text-white/42">
                  Business owner account
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={!overview.canOpenPortal || isOpeningPortal}
                onClick={handleOpenPortal}
              >
                {isOpeningPortal ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Opening
                  </>
                ) : (
                  "Open billing"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <ShieldCheck className="text-primary h-5 w-5" />
              Billing status
            </CardTitle>
            <CardDescription>Stripe and payment access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">Checkout</p>
              <p className="mt-2 text-sm text-white/58">
                {overview.stripeReady
                  ? "Ready to accept subscriptions."
                  : "Add Stripe keys to enable payments."}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">
                Billing updates
              </p>
              <p className="mt-2 text-sm text-white/58">
                {overview.webhookReady
                  ? "Stripe updates are connected."
                  : "Add the Stripe webhook secret to sync renewals and payment changes."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Zap className="text-primary h-5 w-5" />
              Current usage
            </CardTitle>
            <CardDescription>
              {overview.usage?.periodEnd
                ? `Current period until ${formatShortDate(overview.usage.periodEnd)}`
                : "Your current limits"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {overview.usage ? (
              <>
                <UsageBar
                  label="Active rules"
                  used={overview.usage.rulesUsed}
                  limit={overview.usage.rulesLimit}
                />
                <UsageBar
                  label="Messages"
                  used={overview.usage.messagesUsed}
                  limit={overview.usage.messagesLimit}
                />
                <UsageBar
                  label="WhatsApp lines"
                  used={overview.usage.connectionsUsed}
                  limit={overview.usage.connectionsLimit}
                />
              </>
            ) : (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/58">
                Choose a plan to unlock billing limits and renewals.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface-glow overflow-hidden">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-white">
                <CreditCard className="text-primary h-5 w-5" />
                Plans
              </CardTitle>
              <CardDescription>
                Pick the right plan for your business
              </CardDescription>
            </div>
            <div className="inline-flex rounded-[18px] border border-white/10 bg-white/[0.03] p-1">
              {billingIntervals.map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => setSelectedInterval(interval)}
                  className={cn(
                    "rounded-[14px] px-4 py-2 text-sm transition",
                    selectedInterval === interval
                      ? "bg-[linear-gradient(135deg,#3B82F6_0%,#22D3EE_100%)] font-semibold text-[#03111F]"
                      : "text-white/56 hover:text-white",
                  )}
                >
                  {interval === "YEARLY" ? "Yearly" : "Monthly"}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {overview.plans.map((plan) => {
              const displayedPrice =
                selectedInterval === "YEARLY" && plan.yearlyPriceMad
                  ? plan.yearlyPriceMad
                  : plan.monthlyPriceMad;
              const priceSuffix =
                selectedInterval === "YEARLY" && plan.yearlyPriceMad
                  ? "/ year"
                  : "/ month";
              const intervalAvailable =
                selectedInterval === "YEARLY"
                  ? plan.yearlyAvailable
                  : plan.monthlyAvailable;
              const isCurrent = currentPlanSlug === plan.slug;
              const actionLabel = isCurrent
                ? "Current plan"
                : canUsePortalForChanges
                  ? "Change in billing"
                  : "Start plan";

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-[26px] border p-5 transition",
                    isCurrent
                      ? "border-primary/30 bg-[linear-gradient(180deg,rgba(19,29,50,0.82),rgba(10,16,27,0.96))]"
                      : "border-white/10 bg-white/[0.03]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {plan.name}
                      </p>
                      <p className="mt-1 text-sm text-white/54">
                        {plan.description}
                      </p>
                    </div>
                    {isCurrent ? (
                      <Badge className="border-primary/20 bg-primary/10 text-primary">
                        Current
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <p className="font-display text-4xl font-semibold text-white">
                      {formatCurrencyMad(displayedPrice)}
                    </p>
                    <p className="mt-1 text-sm text-white/42">{priceSuffix}</p>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <div className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/16 px-4 py-3">
                      <span className="text-sm text-white/62">Rules</span>
                      <span className="text-sm font-semibold text-white">
                        {plan.maxRules}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/16 px-4 py-3">
                      <span className="text-sm text-white/62">
                        Messages / month
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {plan.maxMonthlyMessages.toLocaleString("en")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/16 px-4 py-3">
                      <span className="text-sm text-white/62">
                        WhatsApp lines
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {plan.maxWhatsAppConnections}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    {canUsePortalForChanges ? (
                      <Button
                        type="button"
                        variant={isCurrent ? "secondary" : "primary"}
                        className="w-full"
                        disabled={isOpeningPortal}
                        onClick={handleOpenPortal}
                      >
                        {isOpeningPortal ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Opening
                          </>
                        ) : (
                          actionLabel
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant={isCurrent ? "secondary" : "primary"}
                        className="w-full"
                        disabled={
                          !overview.stripeReady ||
                          !intervalAvailable ||
                          isCurrent ||
                          checkoutPlanSlug !== null
                        }
                        onClick={() => handleCheckout(plan.slug)}
                      >
                        {checkoutPlanSlug === plan.slug ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Opening
                          </>
                        ) : !intervalAvailable ? (
                          "Not available"
                        ) : (
                          actionLabel
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {overview.currentSubscription ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm font-semibold text-white">
                {overview.currentSubscription.cancelAtPeriodEnd
                  ? "Your plan will end at the close of this billing period."
                  : "Your plan renews automatically."}
              </p>
              <p className="mt-1 text-sm text-white/54">
                Use billing to update payment details, invoices, or plan
                changes.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/64">
              <CalendarClock className="h-4 w-4" />
              {overview.currentSubscription.currentPeriodEnd
                ? formatShortDate(overview.currentSubscription.currentPeriodEnd)
                : "No renewal date"}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!overview.stripeReady ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-primary h-5 w-5" />
              <p className="text-sm text-white/64">
                Add Stripe keys to turn billing on.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
