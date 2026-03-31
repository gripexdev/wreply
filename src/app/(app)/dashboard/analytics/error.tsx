"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardAnalyticsError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <Card className="border-rose-400/20 bg-rose-500/10">
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-100">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-rose-100">
            Could not load analytics
          </p>
          <p className="text-sm leading-6 text-rose-50/80">
            Try again in a moment.
          </p>
        </div>
        <Button variant="secondary" onClick={reset}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
