import { BarChart3, Layers3, MessagesSquare, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { foundationChecklist } from "@/config/navigation";
import { getRequiredSession } from "@/lib/auth";
import { formatCurrencyMad } from "@/lib/utils";
import { getDashboardFoundationData } from "@/services/dashboard/dashboard.service";

const metricDefinitions = [
  {
    key: "rulesCount",
    label: "Auto-reply rules",
    icon: Layers3,
  },
  {
    key: "connectionsCount",
    label: "WhatsApp connections",
    icon: Smartphone,
  },
  {
    key: "messageLogCount",
    label: "Message logs",
    icon: MessagesSquare,
  },
] as const;

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const foundationData = session.user.workspaceId
    ? await getDashboardFoundationData(session.user.workspaceId)
    : null;

  const currentPlan = foundationData?.subscription?.plan;

  return (
    <div className="space-y-8">
      <Card className="surface-glow overflow-hidden">
        <CardContent className="grid gap-6 p-6 sm:p-7 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <Badge className="border-primary/15 bg-primary/10 text-primary">
              Workspace command center
            </Badge>
            <div className="space-y-4">
              <h2 className="font-display text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Operators see the product,
                <span className="text-gradient"> not the scaffolding</span>
              </h2>
              <p className="max-w-2xl text-base leading-7 text-white/58">
                Signed in as {session.user.email}. This workspace now has a
                clearer shell for rules, WhatsApp setup, message visibility,
                settings, and analytics without changing product logic.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                Current plan
              </p>
              <p className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                {currentPlan?.name ?? "No plan yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/54">
                {currentPlan
                  ? `${formatCurrencyMad(currentPlan.monthlyPriceMad)} / month`
                  : "Subscription provider is intentionally not wired yet."}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                Delivery stance
              </p>
              <p className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                Honest logs
              </p>
              <p className="mt-2 text-sm leading-6 text-white/54">
                Prepared, sent, delivered, and failed states remain visible to
                operators throughout the product.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricDefinitions.map((item) => {
          const Icon = item.icon;
          const value = foundationData?.[item.key] ?? 0;

          return (
            <Card key={item.key} className="bg-white/[0.03]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                    {item.label}
                  </p>
                  <span className="border-primary/15 bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="font-display mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
                  {value}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/54">
                  Real counts from the current workspace records.
                </p>
              </CardContent>
            </Card>
          );
        })}

        <Card className="bg-white/[0.03]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                Analytics
              </p>
              <span className="border-primary/15 bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border">
                <BarChart3 className="h-4 w-4" />
              </span>
            </div>
            <p className="font-display mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
              Live
            </p>
            <p className="mt-2 text-sm leading-6 text-white/54">
              Message volume, coverage, fallback usage, and delivery health are
              visible from real workspace logs.
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">System foundations</CardTitle>
            <CardDescription>
              These slices are complete and ready to support ongoing product
              work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {foundationChecklist.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="border-primary/15 bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-[18px] border">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-2">
                      <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-6 text-white/56">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <BarChart3 className="text-primary h-5 w-5" />
              Product lanes
            </CardTitle>
            <CardDescription>
              These areas are now framed by the same design language without
              pretending unfinished systems already exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-dashed border-white/[0.12] bg-white/[0.02] p-5">
              <p className="text-sm font-semibold tracking-[-0.01em] text-white">
                WhatsApp operations
              </p>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Connection status, inbound processing, and honest outbound
                states already fit into the same operator shell.
              </p>
            </div>
            <div className="rounded-[24px] border border-dashed border-white/[0.12] bg-white/[0.02] p-5">
              <p className="text-sm font-semibold tracking-[-0.01em] text-white">
                Rules and coverage
              </p>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Rules management, matching, and fallback behavior now sit next
                to analytics in one consistent visual hierarchy.
              </p>
            </div>
            <div className="rounded-[24px] border border-dashed border-white/[0.12] bg-white/[0.02] p-5">
              <p className="text-sm font-semibold tracking-[-0.01em] text-white">
                Future product work
              </p>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Billing, AI, and deeper admin surfaces remain intentionally
                outside this redesign step.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
