import { Inbox, RefreshCcw, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MessageLogsLoadingState() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function MessageLogsErrorState({
  message,
  onRetry,
}: Readonly<{
  message: string;
  onRetry: () => void;
}>) {
  return (
    <Card className="border-rose-400/20 bg-rose-500/10">
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-rose-100">
            Unable to load message activity
          </p>
          <p className="text-sm leading-6 text-rose-50/80">{message}</p>
        </div>
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export function MessageLogsEmptyState({
  isFiltered,
  onClearFilters,
}: Readonly<{
  isFiltered: boolean;
  onClearFilters: () => void;
}>) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="text-primary flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.03]">
          {isFiltered ? (
            <SearchX className="h-7 w-7" />
          ) : (
            <Inbox className="h-7 w-7" />
          )}
        </span>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-white">
            {isFiltered ? "No logs match these filters" : "No message logs yet"}
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm leading-7">
            {isFiltered
              ? "Try relaxing the search, date range, or fallback filters to inspect more activity."
              : "Incoming and outbound message activity will appear here once webhooks start processing customer conversations."}
          </p>
        </div>
        {isFiltered ? (
          <Button variant="secondary" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
