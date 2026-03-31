import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Bot, MessageSquareText } from "lucide-react";
import { redirect } from "next/navigation";

import {
  FallbackInsightCard,
  IncomingVolumeChart,
  MatchOutcomeChart,
  OutboundStatusChart,
} from "@/components/analytics/analytics-charts";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import {
  DeliveryIssuesInsight,
  TopRulesInsight,
} from "@/components/analytics/analytics-insights";
import { AnalyticsKpiGrid } from "@/components/analytics/analytics-kpi-grid";
import { AnalyticsRangeSelector } from "@/components/analytics/analytics-range-selector";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRequiredSession } from "@/lib/auth";
import { analyticsQuerySchema } from "@/lib/validation/analytics";
import { getWorkspaceAnalytics } from "@/services/analytics/analytics.service";

export const metadata: Metadata = {
  title: "Analytics",
  description: "See message volume, reply coverage, and reply results.",
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardAnalyticsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const session = await getRequiredSession();

  if (!session.user.workspaceId) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const parsedFilters = analyticsQuerySchema.safeParse({
    range: getSingleValue(params.range),
  });
  const analytics = await getWorkspaceAnalytics(
    session.user.workspaceId,
    parsedFilters.success ? parsedFilters.data : {},
  );
  const successfulOutbound =
    analytics.kpis.outboundSent + analytics.kpis.outboundDelivered;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.14fr_0.86fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Analytics
                </Badge>
                <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  Messages,
                  <span className="text-gradient"> replies, results</span>
                </h1>
                <p className="mt-3 text-sm leading-7 text-white/52 sm:text-base">
                  Real customer activity only.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                  Range
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {analytics.rangeLabel}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <AnalyticsRangeSelector activeRange={analytics.range} />
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/messages"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  Messages
                </Link>
                <Link
                  href="/dashboard/rules"
                  className={buttonStyles({ variant: "secondary" })}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Rules
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <BarChart3 className="text-primary h-5 w-5" />
              Quick view
            </CardTitle>
            <CardDescription>What to check first.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                Window
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {analytics.windowLabel}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                Matched
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {analytics.kpis.matchedMessages}/
                {analytics.kpis.totalIncomingMessages}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                Default reply
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {analytics.kpis.fallbackRepliesUsed}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                Sent / failed
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {successfulOutbound} / {analytics.kpis.outboundFailed}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {analytics.hasData ? (
        <>
          <AnalyticsKpiGrid kpis={analytics.kpis} />

          <section className="grid gap-6 xl:grid-cols-2">
            <IncomingVolumeChart points={analytics.series} />
            <MatchOutcomeChart points={analytics.series} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <OutboundStatusChart kpis={analytics.kpis} />
            <FallbackInsightCard kpis={analytics.kpis} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
            <TopRulesInsight
              rules={analytics.topRules}
              matchedMessages={analytics.kpis.matchedMessages}
            />
            <DeliveryIssuesInsight issues={analytics.recentDeliveryIssues} />
          </section>
        </>
      ) : (
        <AnalyticsEmptyState />
      )}

      <Card className="border-white/[0.08] bg-white/[0.02]">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              Need more messages?
            </p>
            <p className="mt-1 text-xs text-white/44">
              Connect WhatsApp or try a message.
            </p>
          </div>
          <Link
            href="/dashboard/whatsapp"
            className={buttonStyles({ variant: "secondary" })}
          >
            WhatsApp
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
