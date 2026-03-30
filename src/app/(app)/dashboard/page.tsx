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
    label: "Total activity",
    description: "Inbound and outbound logs recorded for this workspace.",
    icon: Activity,
    accentClassName:
      "from-primary/30 via-primary/10 to-transparent border-primary/10",
  },
  {
    key: "messagesProcessedToday",
    label: "Processed today",
    description: "Inbound customer messages seen since midnight.",
    icon: MessageSquareText,
    accentClassName:
      "from-secondary-accent/28 via-secondary-accent/8 to-transparent border-secondary-accent/10",
  },
  {
    key: "activeRulesCount",
    label: "Active rules",
    description: "Rules currently eligible to reply to inbound messages.",
    icon: Bot,
    accentClassName:
      "from-emerald-300/20 via-emerald-200/8 to-transparent border-emerald-300/10",
  },
  {
    key: "connectionsCount",
    label: "WhatsApp lines",
    description: "Connected workspace lines that can ingest webhook traffic.",
    icon: RadioTower,
    accentClassName:
      "from-sky-300/22 via-sky-300/8 to-transparent border-sky-300/10",
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
      description:
        "No WhatsApp connection is configured yet, so the system is not monitoring live traffic.",
      badgeClassName: "border-amber-300/15 bg-amber-300/10 text-amber-100",
    };
  }

  if (!foundationData.connection?.webhookSubscribed) {
    return {
      label: "Connection saved",
      description:
        "A WhatsApp line exists, but webhook subscription still needs to be confirmed before live monitoring begins.",
      badgeClassName: "border-amber-300/15 bg-amber-300/10 text-amber-100",
    };
  }

  if (foundationData.activeRulesCount === 0) {
    return {
      label: "Monitoring, rules missing",
      description:
        "Inbound traffic can reach the workspace, but no active rules are ready to respond yet.",
      badgeClassName: "border-sky-300/15 bg-sky-300/10 text-sky-100",
    };
  }

  return {
    label: "Automation monitoring",
    description: foundationData.connection?.sendRepliesEnabled
      ? "Inbound traffic is being monitored and the workspace can attempt live reply delivery."
      : "Inbound traffic is being monitored and replies are logged honestly until live sending is enabled.",
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
      title: "Connect your first line",
      description:
        "The control center is ready, but it needs a WhatsApp line before it can watch incoming customer traffic.",
      primaryHref: "/dashboard/whatsapp",
      primaryLabel: "Configure WhatsApp",
      secondaryHref: "/dashboard/settings",
      secondaryLabel: "Review business settings",
      empty: true,
    };
  }

  if (foundationData.activeRulesCount === 0) {
    return {
      title: "Add automation coverage",
      description:
        "Your line is set up. Add active reply rules so the system can match real inbound questions instead of only collecting logs.",
      primaryHref: "/dashboard/rules",
      primaryLabel: "Create rules",
      secondaryHref: "/dashboard/rules/test",
      secondaryLabel: "Open simulator",
      empty: true,
    };
  }

  if (foundationData.incomingCount === 0) {
    return {
      title: "Waiting for first live message",
      description:
        "Rules are ready and the connection is in place. Test coverage from the simulator or wait for the first customer message to start the activity trail.",
      primaryHref: "/dashboard/rules/test",
      primaryLabel: "Test rules",
      secondaryHref: "/dashboard/whatsapp",
      secondaryLabel: "Review webhook setup",
      empty: true,
    };
  }

  return {
    title: "System is active",
    description:
      "The workspace has live activity. Use message logs to inspect what happened and analytics to improve coverage over time.",
    primaryHref: "/dashboard/messages",
    primaryLabel: "Open messages",
    secondaryHref: "/dashboard/analytics",
    secondaryLabel: "Open analytics",
    empty: false,
  };
}

function StatusRow({
  label,
  value,
  description,
}: Readonly<{
  label: string;
  value: string;
  description: string;
}>) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-[0.68rem] tracking-[0.22em] text-white/36 uppercase">
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold tracking-[-0.01em] text-white">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>
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
    : "No activity recorded yet";
  const lastWebhookLabel = foundationData.connection?.lastWebhookAt
    ? formatDateTime(foundationData.connection.lastWebhookAt)
    : "No webhook events yet";

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
        <Card className="surface-glow overflow-hidden border-white/[0.1] bg-[linear-gradient(180deg,rgba(14,22,38,0.92),rgba(8,13,24,0.94))]">
          <CardContent className="relative p-6 sm:p-7 lg:p-8">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-primary/15 bg-primary/10 text-primary">
                  Automation control center
                </Badge>
                <Badge className={automationStatus.badgeClassName}>
                  {automationStatus.label}
                </Badge>
              </div>

              <div className="space-y-4">
                <h2 className="font-display max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl xl:text-[3.75rem]">
                  Monitor what the system is seeing,
                  <span className="text-gradient">
                    {" "}
                    not just what was built
                  </span>
                </h2>
                <p className="max-w-3xl text-base leading-8 text-white/58 sm:text-[1.02rem]">
                  Watch live automation posture across inbound traffic, rules,
                  fallback behavior, and delivery readiness from one workspace
                  view. Signed in as {session.user.email}.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/36 uppercase">
                    Current plan
                  </p>
                  <p className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                    {currentPlan?.name ?? "No plan"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/52">
                    {currentPlan
                      ? `${formatCurrencyMad(currentPlan.monthlyPriceMad)} / month`
                      : "Subscription billing is not wired yet."}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/36 uppercase">
                    Last activity
                  </p>
                  <p className="mt-3 text-sm font-semibold tracking-[-0.01em] text-white">
                    {lastActivityLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/52">
                    The latest inbound, outbound, or webhook event recorded for
                    this workspace.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/36 uppercase">
                    Messages today
                  </p>
                  <p className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                    {foundationData.messagesProcessedToday}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/52">
                    Inbound messages received since midnight in this workspace.
                  </p>
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

        <Card className="bg-[linear-gradient(180deg,rgba(13,20,36,0.92),rgba(9,13,23,0.96))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <ShieldCheck className="text-primary h-5 w-5" />
              System status
            </CardTitle>
            <CardDescription>
              Real workspace signals that make the dashboard feel alive instead
              of static.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow
              label="Automation status"
              value={automationStatus.label}
              description={automationStatus.description}
            />
            <StatusRow
              label="Last webhook"
              value={lastWebhookLabel}
              description="The latest webhook event recorded for the current WhatsApp connection."
            />
            <StatusRow
              label="Reply posture"
              value={
                foundationData.connection?.sendRepliesEnabled
                  ? "Live send attempts enabled"
                  : "Prepared logging mode"
              }
              description={
                foundationData.connection?.sendRepliesEnabled
                  ? "The workspace can attempt real outbound reply delivery."
                  : "Replies are still tracked honestly, but external delivery is not attempted."
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
            <Card
              key={item.key}
              className="overflow-hidden bg-[linear-gradient(180deg,rgba(13,20,36,0.92),rgba(8,13,24,0.96))]"
            >
              <CardContent className="relative p-5">
                <div
                  className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${item.accentClassName}`}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                      {item.label}
                    </p>
                    <p className="font-display mt-4 text-5xl font-semibold tracking-[-0.06em] text-white">
                      {value}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04] text-white/74 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div className="relative mt-5 h-px bg-gradient-to-r from-white/[0.12] via-white/[0.04] to-transparent" />
                <p className="relative mt-4 text-sm leading-6 text-white/54">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[linear-gradient(180deg,rgba(13,20,36,0.92),rgba(9,13,23,0.96))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Workflow className="text-primary h-5 w-5" />
              Automation status
            </CardTitle>
            <CardDescription>
              The current operating posture of the workspace based on real
              connection, rule, and activity data.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <StatusRow
              label="WhatsApp ingress"
              value={
                foundationData.connectionsCount > 0
                  ? "Connection present"
                  : "No connection"
              }
              description={
                foundationData.connectionsCount > 0
                  ? "A WhatsApp connection record exists for this workspace."
                  : "The system cannot receive inbound traffic until a line is configured."
              }
            />
            <StatusRow
              label="Rule coverage"
              value={`${foundationData.activeRulesCount} active`}
              description={
                foundationData.activeRulesCount > 0
                  ? "Active rules are ready to inspect live messages."
                  : "No active rules are watching inbound message content yet."
              }
            />
            <StatusRow
              label="Inbound traffic"
              value={`${foundationData.incomingCount} recorded`}
              description="All inbound customer messages logged by the workspace so far."
            />
            <StatusRow
              label="Outbound traffic"
              value={`${foundationData.outgoingCount} recorded`}
              description="Outbound replies logged by the system across matched and fallback flows."
            />
          </CardContent>
        </Card>

        <Card className="surface-glow overflow-hidden bg-[linear-gradient(180deg,rgba(13,20,36,0.94),rgba(9,13,23,0.98))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              {guidance.empty ? (
                <Inbox className="text-primary h-5 w-5" />
              ) : (
                <Sparkles className="text-primary h-5 w-5" />
              )}
              {guidance.empty ? "Waiting for live momentum" : "Operator focus"}
            </CardTitle>
            <CardDescription>
              {guidance.empty
                ? "A polished empty state that points the operator toward the next real setup step."
                : "Use the busiest product surfaces to inspect what the system already processed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[26px] border border-dashed border-white/[0.12] bg-white/[0.025] p-6">
              <span className="border-primary/15 bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-[20px] border">
                {guidance.empty ? (
                  <Inbox className="h-6 w-6" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
              </span>
              <h3 className="font-display mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">
                {guidance.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/56">
                {guidance.description}
              </p>
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
