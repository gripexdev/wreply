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
            Unable to load workspace analytics
          </p>
          <p className="text-sm leading-6 text-rose-50/80">
            The analytics data could not be loaded right now. Try the request
            again to refresh the workspace metrics.
          </p>
        </div>
        <Button variant="secondary" onClick={reset}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry analytics
        </Button>
      </CardContent>
    </Card>
  );
}
