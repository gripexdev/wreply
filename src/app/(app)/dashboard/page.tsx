import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Inbox,
  MessageSquareText,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

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
import { formatCurrencyMad, formatDateTime } from "@/lib/utils";
import { getDashboardFoundationData } from "@/services/dashboard/dashboard.service";

const metricDefinitions = [
  {
    key: "messageLogCount",
    label: "Activity",
    helper: "All logs",
    icon: Activity,
  },
  {
    key: "messagesProcessedToday",
    label: "Today",
    helper: "Inbound",
    icon: MessageSquareText,
  },
  {
    key: "activeRulesCount",
    label: "Rules",
    helper: "Live",
    icon: Bot,
  },
  {
    key: "connectionsCount",
    label: "Lines",
    helper: "Connected",
    icon: RadioTower,
  },
] as const;

function buildAutomationStatus(
  foundationData: NonNullable<
    Awaited<ReturnType<typeof getDashboardFoundationData>>
  >,
) {
  if (foundationData.connectionsCount === 0) {
    return {
      label: "Setup needed",
      hint: "Connect WhatsApp.",
      badgeClassName: "border-amber-300/15 bg-amber-300/10 text-amber-100",
    };
  }

  if (!foundationData.connection?.webhookSubscribed) {
    return {
      label: "Webhook off",
      hint: "Verify the line.",
      badgeClassName: "border-amber-300/15 bg-amber-300/10 text-amber-100",
    };
  }

  if (foundationData.activeRulesCount === 0) {
    return {
      label: "No live rules",
      hint: "Add coverage.",
      badgeClassName: "border-[#3B82F6]/15 bg-[#3B82F6]/10 text-[#DBEAFE]",
    };
  }

  return {
    label: foundationData.connection?.sendRepliesEnabled ? "Live" : "Prepared",
    hint: foundationData.connection?.sendRepliesEnabled
      ? "Watching and replying."
      : "Watching and logging.",
    badgeClassName: "border-primary/20 bg-primary/10 text-primary",
  };
}

function buildGuidance(
  foundationData: NonNullable<
    Awaited<ReturnType<typeof getDashboardFoundationData>>
  >,
) {
  if (foundationData.connectionsCount === 0) {
    return {
      title: "Connect WhatsApp",
      hint: "Go live.",
      primaryHref: "/dashboard/whatsapp",
      primaryLabel: "Open WhatsApp",
      secondaryHref: "/dashboard/settings",
      secondaryLabel: "Settings",
    };
  }

  if (foundationData.activeRulesCount === 0) {
    return {
      title: "Add rules",
      hint: "Cover the common questions.",
      primaryHref: "/dashboard/rules",
      primaryLabel: "Open Rules",
      secondaryHref: "/dashboard/rules/test",
      secondaryLabel: "Test",
    };
  }

  if (foundationData.incomingCount === 0) {
    return {
      title: "Waiting for traffic",
      hint: "Everything is ready.",
      primaryHref: "/dashboard/rules/test",
      primaryLabel: "Test Rules",
      secondaryHref: "/dashboard/whatsapp",
      secondaryLabel: "Connection",
    };
  }

  return {
    title: "System active",
    hint: "Review messages and analytics.",
    primaryHref: "/dashboard/messages",
    primaryLabel: "Messages",
    secondaryHref: "/dashboard/analytics",
    secondaryLabel: "Analytics",
  };
}

function StatusRow({
  label,
  value,
  hint,
}: Readonly<{
  label: string;
  value: string;
  hint: string;
}>) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
      <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/42">{hint}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const foundationData = session.user.workspaceId
    ? await getDashboardFoundationData(session.user.workspaceId)
    : null;

  if (!foundationData) {
    return null;
  }

  const currentPlan = foundationData.subscription?.plan;
  const automationStatus = buildAutomationStatus(foundationData);
  const guidance = buildGuidance(foundationData);
  const lastActivityLabel = foundationData.lastActivityAt
    ? formatDateTime(foundationData.lastActivityAt)
    : "No activity";
  const lastWebhookLabel = foundationData.connection?.lastWebhookAt
    ? formatDateTime(foundationData.connection.lastWebhookAt)
    : "No webhook";

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.16fr_0.84fr]">
        <Card className="surface-glow overflow-hidden bg-[linear-gradient(180deg,rgba(12,19,33,0.9),rgba(7,10,18,0.97))]">
          <CardContent className="p-6 sm:p-7 lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-primary/15 bg-primary/10 text-primary">
                  Dashboard
                </Badge>
                <Badge className={automationStatus.badgeClassName}>
                  {automationStatus.label}
                </Badge>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl xl:text-[3.7rem]">
                  Control the
                  <span className="text-gradient"> live system</span>
                </h2>
                <p className="text-sm leading-7 text-white/54 sm:text-base">
                  Messages, rules, and delivery. One view.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                  <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                    Plan
                  </p>
                  <p className="font-display mt-3 text-3xl font-semibold text-white">
                    {currentPlan?.name ?? "No plan"}
                  </p>
                  <p className="mt-1 text-xs text-white/42">
                    {currentPlan
                      ? `${formatCurrencyMad(currentPlan.monthlyPriceMad)} / month`
                      : "No billing yet."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                  <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                    Last activity
                  </p>
                  <p className="mt-3 text-sm font-semibold text-white">
                    {lastActivityLabel}
                  </p>
                  <p className="mt-1 text-xs text-white/42">Latest event.</p>
                </div>

                <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                  <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                    Today
                  </p>
                  <p className="font-display mt-3 text-3xl font-semibold text-white">
                    {foundationData.messagesProcessedToday}
                  </p>
                  <p className="mt-1 text-xs text-white/42">Inbound volume.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={guidance.primaryHref} className={buttonStyles()}>
                  {guidance.primaryLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href={guidance.secondaryHref}
                  className={buttonStyles({ variant: "secondary" })}
                >
                  {guidance.secondaryLabel}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[linear-gradient(180deg,rgba(12,18,31,0.92),rgba(8,11,19,0.98))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <ShieldCheck className="text-primary h-5 w-5" />
              Status
            </CardTitle>
            <CardDescription>Live signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow
              label="Automation"
              value={automationStatus.label}
              hint={automationStatus.hint}
            />
            <StatusRow
              label="Webhook"
              value={lastWebhookLabel}
              hint="Latest event."
            />
            <StatusRow
              label="Delivery"
              value={
                foundationData.connection?.sendRepliesEnabled
                  ? "Live"
                  : "Prepared"
              }
              hint={
                foundationData.connection?.sendRepliesEnabled
                  ? "Real send attempts."
                  : "Logs only."
              }
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricDefinitions.map((item) => {
          const Icon = item.icon;
          const value = foundationData[item.key];

          return (
            <Card key={item.key}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                      {item.label}
                    </p>
                    <p className="font-display mt-4 text-5xl font-semibold tracking-[-0.06em] text-white">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-white/42">{item.helper}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.03] text-white/72">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="bg-[linear-gradient(180deg,rgba(12,18,31,0.92),rgba(8,11,19,0.98))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Workflow className="text-primary h-5 w-5" />
              Signals
            </CardTitle>
            <CardDescription>Core checks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <StatusRow
              label="Ingress"
              value={
                foundationData.connectionsCount > 0 ? "Connected" : "Offline"
              }
              hint={
                foundationData.connectionsCount > 0
                  ? "Line saved."
                  : "Connect WhatsApp."
              }
            />
            <StatusRow
              label="Coverage"
              value={`${foundationData.activeRulesCount} active`}
              hint={
                foundationData.activeRulesCount > 0
                  ? "Rules are live."
                  : "No rules yet."
              }
            />
            <StatusRow
              label="Inbound"
              value={`${foundationData.incomingCount} logged`}
              hint="All customer messages."
            />
            <StatusRow
              label="Outbound"
              value={`${foundationData.outgoingCount} logged`}
              hint="Replies and fallbacks."
            />
          </CardContent>
        </Card>

        <Card className="surface-glow overflow-hidden bg-[linear-gradient(180deg,rgba(12,18,31,0.94),rgba(8,11,19,0.98))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              {guidance.title === "System active" ? (
                <Sparkles className="text-primary h-5 w-5" />
              ) : (
                <Inbox className="text-primary h-5 w-5" />
              )}
              {guidance.title}
            </CardTitle>
            <CardDescription>{guidance.hint}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-6">
              <p className="text-sm font-semibold text-white">
                {guidance.title}
              </p>
              <p className="mt-2 text-sm text-white/50">{guidance.hint}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={guidance.primaryHref} className={buttonStyles()}>
                {guidance.primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={guidance.secondaryHref}
                className={buttonStyles({ variant: "secondary" })}
              >
                {guidance.secondaryLabel}
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
