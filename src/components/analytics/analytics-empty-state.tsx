import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AnalyticsEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <span className="text-primary flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.03]">
          <BarChart3 className="h-7 w-7" />
        </span>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-white">
            Not enough activity for analytics yet
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm leading-7">
            Once WhatsApp messages start arriving, this dashboard will show real
            trends for match rate, fallback usage, outbound delivery, and top
            performing rules.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/whatsapp"
            className={buttonStyles({ variant: "primary" })}
          >
            Connect WhatsApp
          </Link>
          <Link
            href="/dashboard/rules/test"
            className={buttonStyles({ variant: "secondary" })}
          >
            Test Rules
          </Link>
          <Link
            href="/dashboard/messages"
            className={buttonStyles({ variant: "secondary" })}
          >
            Open Messages
          </Link>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <ArrowRight className="h-4 w-4" />
          Analytics updates automatically as new logs are created.
        </div>
      </CardContent>
    </Card>
  );
}
