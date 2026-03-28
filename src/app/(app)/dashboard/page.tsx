import { BarChart3, Layers3, MessagesSquare, Smartphone } from "lucide-react";

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
    <div className="space-y-6">
      <Card className="surface-glow overflow-hidden">
        <CardHeader className="border-b border-white/10 pb-6">
          <CardTitle className="text-3xl text-white">
            Dashboard foundation
          </CardTitle>
          <CardDescription>
            Signed in as {session.user.email}. This area is protected and ready
            for the next feature slices.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
              Current plan
            </p>
            <p className="font-display mt-3 text-2xl font-semibold text-white">
              {currentPlan?.name ?? "No plan yet"}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {currentPlan
                ? `${formatCurrencyMad(currentPlan.monthlyPriceMad)} / month`
                : "Subscription provider not wired yet."}
            </p>
          </div>
          {metricDefinitions.map((item) => {
            const Icon = item.icon;
            const value = foundationData?.[item.key] ?? 0;

            return (
              <div
                key={item.key}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                    {item.label}
                  </p>
                  <Icon className="text-primary h-4 w-4" />
                </div>
                <p className="font-display mt-3 text-3xl font-semibold text-white">
                  {value}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Real counts from the current Prisma workspace records.
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Architecture status</CardTitle>
            <CardDescription>
              These modules are complete for this milestone and ready for
              extension.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {foundationChecklist.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                >
                  <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-6">
                      {item.description}
                    </p>
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
              Next feature lanes
            </CardTitle>
            <CardDescription>
              What the foundation is prepared to support, without claiming those
              systems already exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-dashed border-white/15 p-5">
              <p className="text-sm font-semibold text-white">
                WhatsApp integration lane
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Schema and routing boundaries are ready for webhook ingestion
                and connection sync flows.
              </p>
            </div>
            <div className="rounded-[24px] border border-dashed border-white/15 p-5">
              <p className="text-sm font-semibold text-white">Billing lane</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Plans and subscriptions exist in the schema, but provider logic
                and invoicing are intentionally absent.
              </p>
            </div>
            <div className="rounded-[24px] border border-dashed border-white/15 p-5">
              <p className="text-sm font-semibold text-white">
                Rules management lane
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                The model is ready for CRUD and execution logic, but no
                automation engine is implemented in this step.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
