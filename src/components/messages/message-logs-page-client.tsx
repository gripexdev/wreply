"use client";

import { ListChecks, MessageSquareShare, SendHorizontal, ShieldAlert } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { MessageLogCards } from "@/components/messages/message-log-cards";
import { MessageLogDetailDialog } from "@/components/messages/message-log-detail-dialog";
import {
  MessageLogsEmptyState,
  MessageLogsErrorState,
  MessageLogsLoadingState,
} from "@/components/messages/message-log-states";
import { MessageLogTable } from "@/components/messages/message-log-table";
import { MessageLogToolbar } from "@/components/messages/message-log-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { messageLogsQuerySchema } from "@/lib/validation/message-logs";
import type {
  MessageLogListItem,
  MessageLogsListResponse,
  MessageLogsQueryState,
} from "@/types/message-logs";

function readFilters(searchParams: URLSearchParams) {
  const parsed = messageLogsQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    direction: searchParams.get("direction") ?? undefined,
    outcome: searchParams.get("outcome") ?? undefined,
    sendStatus: searchParams.get("sendStatus") ?? undefined,
    fallback: searchParams.get("fallback") ?? undefined,
    dateRange: searchParams.get("dateRange") ?? undefined,
  });

  if (parsed.success) {
    return parsed.data;
  }

  return messageLogsQuerySchema.parse({});
}

function buildQuery(filters: MessageLogsQueryState) {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.direction !== "all") {
    searchParams.set("direction", filters.direction);
  }

  if (filters.outcome !== "all") {
    searchParams.set("outcome", filters.outcome);
  }

  if (filters.sendStatus !== "all") {
    searchParams.set("sendStatus", filters.sendStatus);
  }

  if (filters.fallback !== "all") {
    searchParams.set("fallback", filters.fallback);
  }

  if (filters.dateRange !== "all") {
    searchParams.set("dateRange", filters.dateRange);
  }

  return searchParams.toString();
}

function isFilteredView(filters: MessageLogsQueryState) {
  return (
    filters.search.length > 0 ||
    filters.direction !== "all" ||
    filters.outcome !== "all" ||
    filters.sendStatus !== "all" ||
    filters.fallback !== "all" ||
    filters.dateRange !== "all"
  );
}

async function readResponse<T>(response: Response) {
  return (await response.json().catch(() => null)) as T | null;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: Readonly<{
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}>) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
            {title}
          </p>
          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="font-display mt-4 text-3xl font-semibold text-white">
          {value}
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function MessageLogsPageClient({
  initialFilters,
}: Readonly<{
  initialFilters: MessageLogsQueryState;
}>) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<MessageLogsQueryState>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const deferredSearchInput = useDeferredValue(searchInput);
  const [data, setData] = useState<MessageLogsListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedLog, setSelectedLog] = useState<MessageLogListItem | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = deferredSearchInput.trim();
      setFilters((currentValue) =>
        currentValue.search === nextSearch
          ? currentValue
          : { ...currentValue, search: nextSearch },
      );
    }, 220);

    return () => window.clearTimeout(timer);
  }, [deferredSearchInput]);

  useEffect(() => {
    const handlePopState = () => {
      const nextFilters = readFilters(
        new URLSearchParams(window.location.search),
      );
      setFilters(nextFilters);
      setSearchInput(nextFilters.search);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const nextQuery = buildQuery(filters);
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentUrl = `${pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [filters, pathname]);

  useEffect(() => {
    const controller = new AbortController();
    const query = buildQuery(filters);

    async function loadLogs() {
      setError(null);

      if (hasLoadedOnceRef.current) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await fetch(
          query ? `/api/messages?${query}` : "/api/messages",
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );
        const payload = await readResponse<
          MessageLogsListResponse & { message?: string }
        >(response);

        if (!response.ok || !payload) {
          throw new Error(payload?.message ?? "Unable to load message activity.");
        }

        setData(payload);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load message activity.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
          hasLoadedOnceRef.current = true;
        }
      }
    }

    void loadLogs();

    return () => controller.abort();
  }, [filters, reloadToken]);

  const summary = data?.summary ?? {
    total: 0,
    inbound: 0,
    outbound: 0,
    matchedInbound: 0,
    fallbackReplies: 0,
    failedReplies: 0,
  };
  const logs = data?.logs ?? [];
  const isFiltered = isFilteredView(filters);

  function refreshLogs() {
    setReloadToken((currentValue) => currentValue + 1);
  }

  function handleFilterChange(
    key: keyof Omit<MessageLogsQueryState, "search">,
    value: string,
  ) {
    setFilters((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
  }

  function clearFilters() {
    const nextFilters = messageLogsQuerySchema.parse({});
    setFilters(nextFilters);
    setSearchInput(nextFilters.search);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.16fr_0.84fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Operator activity
                </Badge>
                <h1 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  Message activity
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-base">
                  Inspect inbound customer questions, outbound replies, fallback
                  behavior, and delivery outcomes with enough detail to trust what
                  the automation actually did.
                </p>
              </div>

              <div className="text-muted-foreground rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                {isRefreshing ? "Refreshing activity..." : "Workspace-scoped logs only"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                Operator clarity
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                Each row makes the reply source explicit, so matched rules,
                unmatched fallbacks, and send failures are visible without digging
                through raw webhook payloads.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="border-white/10 bg-white/[0.03] text-white">
                matched vs unmatched
              </Badge>
              <Badge className="border-white/10 bg-white/[0.03] text-white">
                fallback traceability
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total events"
          value={summary.total}
          description="Inbound and outbound logs returned by the current filters."
          icon={ListChecks}
        />
        <SummaryCard
          title="Inbound"
          value={summary.inbound}
          description="Customer messages received for the filtered window."
          icon={MessageSquareShare}
        />
        <SummaryCard
          title="Fallback replies"
          value={summary.fallbackReplies}
          description="Outbound replies created from fallback behavior instead of a rule match."
          icon={SendHorizontal}
        />
        <SummaryCard
          title="Send failures"
          value={summary.failedReplies}
          description="Outbound sends that failed after a real delivery attempt."
          icon={ShieldAlert}
        />
      </section>

      <MessageLogToolbar
        filters={filters}
        searchInput={searchInput}
        isSyncing={isRefreshing}
        onSearchInputChange={setSearchInput}
        onFilterChange={handleFilterChange}
        settingsHref="/dashboard/settings"
      />

      {error && data ? (
        <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <MessageLogsLoadingState />
      ) : error && !data ? (
        <MessageLogsErrorState message={error} onRetry={refreshLogs} />
      ) : logs.length === 0 ? (
        <MessageLogsEmptyState isFiltered={isFiltered} onClearFilters={clearFilters} />
      ) : (
        <>
          <MessageLogTable logs={logs} onView={setSelectedLog} />
          <MessageLogCards logs={logs} onView={setSelectedLog} />
        </>
      )}

      <MessageLogDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
