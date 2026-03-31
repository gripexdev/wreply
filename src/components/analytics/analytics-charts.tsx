import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight, BarChart3, Layers3, Send } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalyticsKpis, AnalyticsSeriesPoint } from "@/types/analytics";

function EmptyChartState({
  message,
}: Readonly<{
  message: string;
}>) {
  return (
    <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.03] px-6 text-center text-sm text-white/54">
      {message}
    </div>
  );
}

function ChartShell({
  title,
  description,
  icon: Icon,
  children,
}: Readonly<{
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <Icon className="text-primary h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function IncomingVolumeChart({
  points,
}: Readonly<{
  points: AnalyticsSeriesPoint[];
}>) {
  const maxIncoming = Math.max(...points.map((point) => point.incoming), 0);

  return (
    <ChartShell
      title="Messages over time"
      description="By day."
      icon={BarChart3}
    >
      {maxIncoming === 0 ? (
        <EmptyChartState message="No messages yet" />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            {points.map((point) => {
              const height = point.incoming
                ? Math.max((point.incoming / maxIncoming) * 100, 8)
                : 0;

              return (
                <div
                  key={point.dateKey}
                  className="flex w-11 flex-col items-center justify-end"
                >
                  <span className="mb-2 text-xs text-white/70">
                    {point.incoming > 0 ? point.incoming : ""}
                  </span>
                  <div className="flex h-52 w-full items-end rounded-[20px] bg-black/20 p-1">
                    <div
                      className="bg-primary/90 w-full rounded-[16px] shadow-[0_20px_30px_-18px_rgba(34,211,238,0.72)]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="mt-3 text-[11px] text-white/55">
                    {point.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ChartShell>
  );
}

export function MatchOutcomeChart({
  points,
}: Readonly<{
  points: AnalyticsSeriesPoint[];
}>) {
  const maxTotal = Math.max(
    ...points.map((point) => point.matched + point.unmatched),
    0,
  );

  return (
    <ChartShell title="Matched vs missed" description="By day." icon={Layers3}>
      {maxTotal === 0 ? (
        <EmptyChartState message="No matched messages yet" />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-xs tracking-[0.18em] text-white/60 uppercase">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              matched
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              missed
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              {points.map((point) => {
                const total = point.matched + point.unmatched;
                const totalHeight = total
                  ? Math.max((total / maxTotal) * 100, 8)
                  : 0;
                const matchedHeight = total
                  ? (point.matched / total) * totalHeight
                  : 0;
                const unmatchedHeight = total
                  ? (point.unmatched / total) * totalHeight
                  : 0;

                return (
                  <div
                    key={point.dateKey}
                    className="flex w-11 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-xs text-white/70">
                      {total > 0 ? total : ""}
                    </span>
                    <div className="flex h-52 w-full items-end rounded-[20px] bg-black/20 p-1">
                      <div className="flex h-full w-full flex-col justify-end gap-[3px]">
                        {unmatchedHeight > 0 ? (
                          <div
                            className="rounded-[14px] bg-amber-300/90"
                            style={{ height: `${unmatchedHeight}%` }}
                          />
                        ) : null}
                        {matchedHeight > 0 ? (
                          <div
                            className="rounded-[14px] bg-emerald-300/90"
                            style={{ height: `${matchedHeight}%` }}
                          />
                        ) : null}
                      </div>
                    </div>
                    <span className="mt-3 text-[11px] text-white/55">
                      {point.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </ChartShell>
  );
}

export function OutboundStatusChart({
  kpis,
}: Readonly<{
  kpis: AnalyticsKpis;
}>) {
  const distribution = [
    {
      label: "Prepared",
      value: kpis.outboundPrepared,
      className: "bg-amber-300/90",
    },
    {
      label: "Sent",
      value: kpis.outboundSent,
      className: "bg-emerald-300/90",
    },
    {
      label: "Delivered",
      value: kpis.outboundDelivered,
      className: "bg-[#22D3EE]/90",
    },
    {
      label: "Failed",
      value: kpis.outboundFailed,
      className: "bg-rose-300/90",
    },
  ];
  const total = distribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartShell
      title="Reply status"
      description="Prepared, sent, delivered, failed."
      icon={Send}
    >
      {total === 0 ? (
        <EmptyChartState message="No replies yet" />
      ) : (
        <div className="space-y-4">
          {distribution.map((item) => {
            const width = total ? (item.value / total) * 100 : 0;

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3 text-white/90">
                    <span
                      className={cn("h-3 w-3 rounded-full", item.className)}
                    />
                    {item.label}
                  </div>
                  <div className="text-white/70">
                    {item.value} / {Math.round(width)}%
                  </div>
                </div>
                <div className="h-3 rounded-full bg-black/20">
                  <div
                    className={cn(
                      "h-full rounded-full shadow-[0_16px_24px_-18px_rgba(255,255,255,0.7)]",
                      item.className,
                    )}
                    style={{
                      width: `${Math.max(width, item.value > 0 ? 6 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs text-white/46">
            Sent and delivered are shown separately.
          </div>
        </div>
      )}
    </ChartShell>
  );
}

export function FallbackInsightCard({
  kpis,
}: Readonly<{
  kpis: AnalyticsKpis;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <ArrowUpRight className="text-primary h-5 w-5" />
          Default reply
        </CardTitle>
        <CardDescription>Used when no rule matched.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
            Default reply used
          </p>
          <p className="font-display mt-3 text-3xl font-semibold text-white">
            {kpis.fallbackRepliesUsed}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {kpis.fallbackUsageRate}% of messages
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
            Unmatched messages
          </p>
          <p className="mt-3 text-sm text-white/82">
            {kpis.unmatchedMessages === 0
              ? "Every message found a reply."
              : `${kpis.unmatchedMessages} messages did not match a saved reply.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
