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
  hint: string;
  icon: ComponentType<{ className?: string }>;
  suffix?: string;
}

const kpiCards: AnalyticsKpiCardDefinition[] = [
  {
    key: "totalIncomingMessages",
    label: "Incoming",
    hint: "All",
    icon: MessageSquareText,
  },
  {
    key: "matchedMessages",
    label: "Matched",
    hint: "Covered",
    icon: CheckCircle2,
  },
  {
    key: "unmatchedMessages",
    label: "Open",
    hint: "Need rules",
    icon: ShieldOff,
  },
  {
    key: "matchRate",
    label: "Match rate",
    hint: "Coverage",
    icon: Percent,
    suffix: "%",
  },
  {
    key: "fallbackRepliesUsed",
    label: "Fallback",
    hint: "Used",
    icon: LifeBuoy,
  },
  { key: "outboundPrepared", label: "Prepared", hint: "Queued", icon: Clock3 },
  { key: "outboundSent", label: "Sent", hint: "Accepted", icon: Send },
  {
    key: "outboundDelivered",
    label: "Delivered",
    hint: "Confirmed",
    icon: PackageCheck,
  },
  {
    key: "outboundFailed",
    label: "Failed",
    hint: "Review",
    icon: AlertTriangle,
  },
  { key: "activeRules", label: "Active rules", hint: "Live", icon: Layers3 },
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
                ? "surface-glow border-primary/12 bg-primary/[0.06]"
                : undefined
            }
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                    {item.label}
                  </p>
                  <p className="font-display mt-4 text-3xl font-semibold text-white">
                    {formatValue(kpis[item.key], item.suffix)}
                  </p>
                  <p className="mt-1 text-xs text-white/42">{item.hint}</p>
                </div>
                <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
