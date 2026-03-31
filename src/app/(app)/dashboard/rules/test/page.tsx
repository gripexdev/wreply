import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ScanSearch } from "lucide-react";

import { MessageMatchSimulator } from "@/components/messages/message-match-simulator";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reply Preview",
  description: "Try a customer message and see which reply would be used.",
};

export default function DashboardRulesTestPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Reply preview
                </Badge>
                <h1 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  Try a customer message
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-base">
                  See which saved reply would be used.
                </p>
              </div>

              <Link
                href="/dashboard/rules"
                className={buttonStyles({ variant: "secondary" })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to rules
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                How it works
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                Active rules only. Higher priority rules win first.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
              <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ScanSearch className="h-5 w-5" />
              </span>
              <p className="text-sm leading-6 text-white/90">
                This uses the same reply check as your live account.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <MessageMatchSimulator />
    </div>
  );
}
