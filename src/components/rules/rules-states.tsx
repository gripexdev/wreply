import { CircleAlert, SearchX, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RulesLoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-14 w-full" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 border-t border-white/10 pt-4 lg:grid-cols-[1.2fr_1.9fr_0.8fr_0.8fr_0.6fr_1fr_1.1fr]"
            >
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
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
      <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] border border-rose-400/20 bg-rose-500/10 text-rose-200">
          <CircleAlert className="h-8 w-8" />
        </span>
        <h3 className="font-display text-2xl font-semibold text-white">
          Unable to load your rules
        </h3>
        <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-7">
          {message}
        </p>
        <Button className="mt-6" onClick={onRetry}>
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
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <span className="text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5">
          {isFiltered ? (
            <SearchX className="h-9 w-9" />
          ) : (
            <Sparkles className="h-9 w-9" />
          )}
        </span>
        <h3 className="font-display text-2xl font-semibold text-white">
          {isFiltered
            ? "No rules match these filters"
            : "Create your first auto-reply rule"}
        </h3>
        <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-7">
          {isFiltered
            ? "Try a broader search, switch the filters back to all, or create a new rule that better covers your customer questions."
            : "Start with the most common customer questions about price, location, stock, delivery, or opening hours. You can refine the wording and priority at any time."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!isFiltered ? (
            <Button onClick={onCreateRule}>New Rule</Button>
          ) : (
            <>
              <Button onClick={onClearFilters}>Clear filters</Button>
              <Button variant="secondary" onClick={onCreateRule}>
                New Rule
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
