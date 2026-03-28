import type { ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Layers3,
  LifeBuoy,
  MessageSquareText,
  PackageCheck,
  Percent,
  Send,
  ShieldOff,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsKpis } from "@/types/analytics";

interface AnalyticsKpiCardDefinition {
  key: keyof AnalyticsKpis;
  label: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  suffix?: string;
}

const kpiCards: AnalyticsKpiCardDefinition[] = [
  {
    key: "totalIncomingMessages",
    label: "Incoming messages",
    helper: "Inbound customer questions received",
    icon: MessageSquareText,
  },
  {
    key: "matchedMessages",
    label: "Matched messages",
    helper: "Inbound messages covered by active rules",
    icon: CheckCircle2,
  },
  {
    key: "unmatchedMessages",
    label: "Unmatched messages",
    helper: "Messages that still need rule coverage",
    icon: ShieldOff,
  },
  {
    key: "matchRate",
    label: "Match rate",
    helper: "Share of inbound volume matched by rules",
    icon: Percent,
    suffix: "%",
  },
  {
    key: "fallbackRepliesUsed",
    label: "Fallback replies",
    helper: "Messages handled by the fallback reply flow",
    icon: LifeBuoy,
  },
  {
    key: "outboundPrepared",
    label: "Prepared replies",
    helper: "Logged but not sent externally yet",
    icon: Clock3,
  },
  {
    key: "outboundSent",
    label: "Sent replies",
    helper: "Outbound replies accepted for sending",
    icon: Send,
  },
  {
    key: "outboundDelivered",
    label: "Delivered replies",
    helper: "Replies confirmed as delivered by Meta",
    icon: PackageCheck,
  },
  {
    key: "outboundFailed",
    label: "Failed replies",
    helper: "Outbound replies that need operator review",
    icon: AlertTriangle,
  },
  {
    key: "activeRules",
    label: "Active rules",
    helper: "Rules currently eligible for matching",
    icon: Layers3,
  },
];

function formatValue(value: number, suffix?: string) {
  const normalizedValue = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);

  return suffix ? `${normalizedValue}${suffix}` : normalizedValue;
}

export function AnalyticsKpiGrid({
  kpis,
}: Readonly<{
  kpis: AnalyticsKpis;
}>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {kpiCards.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.key}
            className={
              item.key === "matchRate"
                ? "surface-glow border-primary/15 bg-primary/[0.08]"
                : undefined
            }
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                    {item.label}
                  </p>
                  <p className="font-display mt-4 text-3xl font-semibold text-white">
                    {formatValue(kpis[item.key], item.suffix)}
                  </p>
                </div>
                <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="text-muted-foreground mt-4 text-sm leading-6">
                {item.helper}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
