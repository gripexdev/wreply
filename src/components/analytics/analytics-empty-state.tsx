import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AnalyticsEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <span className="text-primary flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/[0.08] bg-white/[0.03]">
          <BarChart3 className="h-7 w-7" />
        </span>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-white">
            No analytics yet
          </h2>
          <p className="text-sm text-white/46">Connect WhatsApp to start.</p>
        </div>
        <Link href="/dashboard/whatsapp" className={buttonStyles()}>
          Connect WhatsApp
        </Link>
      </CardContent>
    </Card>
  );
}
