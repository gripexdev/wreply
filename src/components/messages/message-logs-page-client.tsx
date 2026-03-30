"use client";

import type { ComponentType } from "react";
import {
  Bot,
  MessageCircleMore,
  Radar,
  SendHorizontal,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
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
  icon: ComponentType<{ className?: string }>;
}>) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(99,232,197,0.88),rgba(47,143,255,0.72))]" />
        <div className="flex items-center justify-between">
          <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
            {title}
          </p>
          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="font-display mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">
          {value}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/66">{description}</p>
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
  const [selectedLog, setSelectedLog] = useState<MessageLogListItem | null>(
    null,
  );
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
          throw new Error(
            payload?.message ?? "Unable to load message activity.",
          );
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
  const unmatchedInbound = Math.max(
    summary.inbound - summary.matchedInbound,
    0,
  );

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
      <section className="grid gap-4 xl:grid-cols-[1.14fr_0.86fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(68,216,180,0.18),transparent_64%)]" />
            <div className="relative">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                Conversation intelligence
              </Badge>
              <h1 className="font-display mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                See what customers asked, what automation decided, and where
                delivery needs attention.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                WReply turns raw inbound and outbound logs into an
                operator-ready view of rule matches, fallback behavior, and
                reply outcomes across your workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/72">
                  Inbound signal
                </div>
                <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/72">
                  Match visibility
                </div>
                <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/72">
                  Delivery traceability
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
                  Live operator snapshot
                </p>
                <p className="mt-2 text-sm leading-6 text-white/74">
                  A fast read on message flow for the current filters.
                </p>
              </div>
              <span className="text-primary flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
                <Radar className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Rule matches
                    </p>
                    <p className="mt-1 text-sm text-white/62">
                      Inbound messages that resolved through an active rule.
                    </p>
                  </div>
                  <p className="font-display text-2xl font-semibold text-white">
                    {summary.matchedInbound}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                  <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                    Unmatched inbound
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {unmatchedInbound}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                  <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                    Outbound replies
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {summary.outbound}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Messages tracked"
          value={summary.total}
          description="Inbound and outbound activity visible in the current scope."
          icon={MessageCircleMore}
        />
        <SummaryCard
          title="Matched inbound"
          value={summary.matchedInbound}
          description="Customer messages that resolved through a saved rule."
          icon={Sparkles}
        />
        <SummaryCard
          title="Fallback replies"
          value={summary.fallbackReplies}
          description="Replies created from fallback behavior instead of a rule match."
          icon={Bot}
        />
        <SummaryCard
          title="Failed sends"
          value={summary.failedReplies}
          description="Outbound attempts that reached the provider and failed."
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
        <MessageLogsEmptyState
          isFiltered={isFiltered}
          onClearFilters={clearFilters}
        />
      ) : (
        <>
          <Card className="overflow-hidden border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,16,29,0.82),rgba(7,11,20,0.96))]">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
                  Conversation stream
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Review the latest inbound questions and outbound replies with
                  match context, fallback visibility, and delivery state.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/62">
                <SendHorizontal className="h-4 w-4" />
                {logs.length} log item{logs.length === 1 ? "" : "s"} in view
              </div>
            </CardContent>
          </Card>

          <MessageLogTable logs={logs} onView={setSelectedLog} />
          <MessageLogCards logs={logs} onView={setSelectedLog} />
        </>
      )}

      <MessageLogDetailDialog
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
