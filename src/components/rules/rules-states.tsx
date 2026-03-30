import { CircleAlert, SearchX, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RulesLoadingState() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="grid gap-4 xl:grid-cols-[0.9fr_auto_1.1fr]">
                <Skeleton className="h-44 w-full" />
                <div className="flex items-center justify-center">
                  <Skeleton className="h-11 w-11 rounded-full" />
                </div>
                <Skeleton className="h-44 w-full" />
              </div>
              <Skeleton className="h-28 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RulesErrorState({
  message,
  onRetry,
}: Readonly<{
  message: string;
  onRetry: () => void;
}>) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-rose-300/15 bg-rose-300/10 text-rose-100">
          <CircleAlert className="h-9 w-9" />
        </span>
        <h3 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">
          Rules unavailable
        </h3>
        <p className="mt-3 max-w-lg text-sm text-white/48">{message}</p>
        <Button className="mt-7" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export function RulesEmptyState({
  isFiltered,
  onCreateRule,
  onClearFilters,
}: Readonly<{
  isFiltered: boolean;
  onCreateRule: () => void;
  onClearFilters: () => void;
}>) {
  return (
    <Card className="surface-glow overflow-hidden">
      <CardContent className="px-6 py-16 text-center sm:px-10">
        <div className="mx-auto max-w-2xl">
          <span className="text-primary mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,27,44,0.92),rgba(9,14,25,0.95))] shadow-[0_30px_80px_-50px_rgba(68,216,180,0.55)]">
            {isFiltered ? (
              <SearchX className="h-10 w-10" />
            ) : (
              <Sparkles className="h-10 w-10" />
            )}
          </span>

          <h3 className="font-display mt-8 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            {isFiltered ? "No rules found" : "Create your first auto-reply"}
          </h3>

          <p className="mt-4 text-sm text-white/48 sm:text-base">
            {isFiltered
              ? "Try a wider filter."
              : "Start with the questions you get every day."}
          </p>

          <div className="mx-auto mt-8 max-w-xl rounded-[28px] border border-dashed border-white/[0.12] bg-white/[0.025] p-5 text-left">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1.2fr)] sm:items-center">
              <div className="border-primary/15 bg-primary/10 rounded-[20px] border px-4 py-4">
                <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                  Trigger
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">
                  price
                </p>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-primary flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-4">
                <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                  Reply
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Salam. Send the product name or photo.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!isFiltered ? (
              <Button onClick={onCreateRule}>New Rule</Button>
            ) : (
              <Button onClick={onClearFilters}>Clear filters</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
