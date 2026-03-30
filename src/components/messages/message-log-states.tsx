import Link from "next/link";
import { Inbox, RefreshCcw, SearchX, Wifi } from "lucide-react";

import { buttonStyles, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ConversationSkeleton() {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-black/18 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-11 rounded-[18px]" />
      </div>
      <div className="mt-5 flex justify-start">
        <Skeleton className="h-32 w-full max-w-[34rem] rounded-[30px]" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-26 w-full rounded-[24px]" />
        <Skeleton className="h-26 w-full rounded-[24px]" />
      </div>
    </div>
  );
}

export function MessageLogsLoadingState() {
  return (
    <div className="space-y-4">
      <ConversationSkeleton />
      <ConversationSkeleton />
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
    <Card className="border-rose-400/20 bg-[linear-gradient(180deg,rgba(72,18,32,0.42),rgba(23,10,17,0.94))]">
      <CardContent className="flex flex-col items-start gap-5 p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-rose-300/20 bg-rose-500/10 text-rose-100">
          <Wifi className="h-6 w-6" />
        </span>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-rose-100">
            Unable to load conversation activity
          </p>
          <p className="text-sm leading-6 text-rose-50/78">{message}</p>
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
    <Card className="overflow-hidden">
      <CardContent className="relative px-6 py-14 text-center sm:px-8">
        <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(68,216,180,0.12),transparent_62%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
          <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs tracking-[0.18em] text-white/54 uppercase">
            {isFiltered ? (
              <SearchX className="h-4 w-4" />
            ) : (
              <Inbox className="h-4 w-4" />
            )}
            Conversation visibility
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.4rem]">
              {isFiltered ? "No messages found" : "No messages yet"}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isFiltered
                ? "Try a wider filter."
                : "Connect WhatsApp to start."}
            </p>
          </div>

          {isFiltered ? (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : (
            <Link href="/dashboard/whatsapp" className={buttonStyles()}>
              Connect WhatsApp
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
