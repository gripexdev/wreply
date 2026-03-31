"use client";

import type { ComponentType } from "react";
import { ArrowRight, Layers3, ListFilter, Sparkles, Zap } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { RuleDeleteDialog } from "@/components/rules/rule-delete-dialog";
import { RuleFormDialog } from "@/components/rules/rule-form-dialog";
import { RuleInspector } from "@/components/rules/rule-inspector";
import { RulesCards } from "@/components/rules/rules-cards";
import { RulesPagination } from "@/components/rules/rules-pagination";
import {
  RulesEmptyState,
  RulesErrorState,
  RulesLoadingState,
} from "@/components/rules/rules-states";
import { RulesTable } from "@/components/rules/rules-table";
import { RulesToolbar } from "@/components/rules/rules-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { rulesQuerySchema } from "@/lib/validation/rules";
import type {
  RuleListItem,
  RuleMoveResponse,
  RuleMutationResponse,
  RulePageSize,
  RulesListResponse,
  RulesQueryState,
  RuleSortOption,
} from "@/types/rules";

function readFilters(searchParams: URLSearchParams) {
  const parsed = rulesQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    matchType: searchParams.get("matchType") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (parsed.success) {
    return parsed.data;
  }

  return rulesQuerySchema.parse({});
}

function buildRulesQuery(filters: RulesQueryState) {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.status !== "all") {
    searchParams.set("status", filters.status);
  }

  if (filters.language !== "all") {
    searchParams.set("language", filters.language);
  }

  if (filters.matchType !== "all") {
    searchParams.set("matchType", filters.matchType);
  }

  if (filters.category) {
    searchParams.set("category", filters.category);
  }

  if (filters.sort !== "priority_asc") {
    searchParams.set("sort", filters.sort);
  }

  if (filters.page !== 1) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.pageSize !== 25) {
    searchParams.set("pageSize", String(filters.pageSize));
  }

  return searchParams.toString();
}

function isFilteredView(filters: RulesQueryState) {
  return (
    filters.search.length > 0 ||
    filters.status !== "all" ||
    filters.language !== "all" ||
    filters.matchType !== "all" ||
    filters.category.length > 0
  );
}

function shiftSummary(
  summary: RulesListResponse["summary"],
  previousValue: boolean,
  nextValue: boolean,
) {
  if (previousValue === nextValue) {
    return summary;
  }

  return {
    total: summary.total,
    active: summary.active + (nextValue ? 1 : -1),
    inactive: summary.inactive + (nextValue ? -1 : 1),
  };
}

async function readResponse<T>(response: Response) {
  return (await response.json().catch(() => null)) as T | null;
}

function SummaryCard({
  title,
  value,
  hint,
  icon: Icon,
  accentClassName,
}: Readonly<{
  title: string;
  value: string | number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  accentClassName: string;
}>) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(13,20,36,0.94),rgba(8,13,24,0.97))]">
      <CardContent className="relative p-5">
        <div
          className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${accentClassName}`}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
              {title}
            </p>
            <p className="font-display mt-4 text-5xl font-semibold tracking-[-0.06em] text-white">
              {value}
            </p>
          </div>
          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="relative mt-5 h-px bg-gradient-to-r from-white/[0.12] via-white/[0.04] to-transparent" />
        <p className="relative mt-2 text-xs text-white/42">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function RulesPageClient({
  initialFilters,
}: Readonly<{
  initialFilters: RulesQueryState;
}>) {
  const pathname = usePathname();
  const { pushToast } = useToast();
  const [filters, setFilters] = useState<RulesQueryState>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const deferredSearchInput = useDeferredValue(searchInput);
  const [data, setData] = useState<RulesListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [busyRuleId, setBusyRuleId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const [editorState, setEditorState] = useState<{
    mode: "create" | "edit";
    rule: RuleListItem | null;
  } | null>(null);
  const [deleteRule, setDeleteRule] = useState<RuleListItem | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = deferredSearchInput.trim();
      setFilters((currentValue) =>
        currentValue.search === nextSearch
          ? currentValue
          : { ...currentValue, search: nextSearch, page: 1 },
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
    const nextQuery = buildRulesQuery(filters);
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentUrl = `${pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [filters, pathname]);

  useEffect(() => {
    const controller = new AbortController();
    const query = buildRulesQuery(filters);

    async function loadRules() {
      setError(null);

      if (hasLoadedOnceRef.current) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await fetch(
          query ? `/api/rules?${query}` : "/api/rules",
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );
        const payload = await readResponse<
          RulesListResponse & { message?: string }
        >(response);

        if (!response.ok || !payload) {
          throw new Error(payload?.message ?? "Could not load your rules.");
        }

        setData(payload);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load your rules.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
          hasLoadedOnceRef.current = true;
        }
      }
    }

    void loadRules();

    return () => controller.abort();
  }, [filters, reloadToken]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setFilters((currentValue) =>
      currentValue.page === data.filters.page
        ? currentValue
        : { ...currentValue, page: data.filters.page },
    );
  }, [data]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (data.rules.length === 0) {
      setSelectedRuleId(null);
      return;
    }

    const hasSelectedRule = data.rules.some(
      (rule) => rule.id === selectedRuleId,
    );

    if (!hasSelectedRule) {
      setSelectedRuleId(data.rules[0].id);
    }
  }, [data, selectedRuleId]);

  const currentRules = data?.rules ?? [];
  const summary = data?.summary ?? { total: 0, active: 0, inactive: 0 };
  const categories = data?.categories ?? [];
  const pagination = data?.pagination ?? {
    page: filters.page,
    pageSize: filters.pageSize,
    totalItems: 0,
    totalPages: 1,
    startItem: 0,
    endItem: 0,
  };
  const isFiltered = isFilteredView(filters);
  const isReorderLocked =
    isFiltered ||
    filters.sort !== "priority_asc" ||
    pagination.totalPages > 1 ||
    filters.page !== 1;
  const selectedRule =
    currentRules.find((rule) => rule.id === selectedRuleId) ?? null;
  const selectedRuleIndex = selectedRule
    ? currentRules.findIndex((rule) => rule.id === selectedRule.id)
    : -1;

  function refreshRules() {
    setReloadToken((currentValue) => currentValue + 1);
  }

  function handleFilterChange(
    key: "status" | "language" | "matchType" | "category",
    value: string,
  ) {
    setFilters((currentValue) => ({
      ...currentValue,
      [key]: value,
      page: 1,
    }));
  }

  function handleSortChange(value: RuleSortOption) {
    setFilters((currentValue) => ({
      ...currentValue,
      sort: value,
      page: 1,
    }));
  }

  function handlePageSizeChange(value: RulePageSize) {
    setFilters((currentValue) => ({
      ...currentValue,
      pageSize: value,
      page: 1,
    }));
  }

  function handlePageChange(page: number) {
    setFilters((currentValue) =>
      currentValue.page === page ? currentValue : { ...currentValue, page },
    );
  }

  function clearFilters() {
    const nextFilters = rulesQuerySchema.parse({});
    setFilters(nextFilters);
    setSearchInput(nextFilters.search);
  }

  async function handleToggleRule(rule: RuleListItem, nextValue: boolean) {
    if (!data) {
      return;
    }

    const previousData = data;
    setBusyRuleId(rule.id);
    setData({
      ...data,
      rules: data.rules.map((currentRule) =>
        currentRule.id === rule.id
          ? { ...currentRule, isActive: nextValue }
          : currentRule,
      ),
      summary: shiftSummary(data.summary, rule.isActive, nextValue),
    });

    try {
      const response = await fetch(`/api/rules/${rule.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: nextValue }),
      });
      const payload = await readResponse<
        RuleMutationResponse & { message?: string }
      >(response);

      if (!response.ok || !payload) {
        throw new Error(payload?.message ?? "Unable to update this rule.");
      }

      setData((currentValue) => {
        if (!currentValue) {
          return currentValue;
        }

        return {
          ...currentValue,
          rules: currentValue.rules
            .map((currentRule) =>
              currentRule.id === rule.id ? payload.rule : currentRule,
            )
            .filter((currentRule) => {
              if (filters.status === "active") {
                return currentRule.isActive;
              }

              if (filters.status === "inactive") {
                return !currentRule.isActive;
              }

              return true;
            }),
        };
      });

      pushToast({
        variant: "success",
        title: nextValue ? "Rule turned on" : "Rule turned off",
        description: `"${rule.keyword}" was updated successfully.`,
      });

      refreshRules();
    } catch (toggleError) {
      setData(previousData);
      pushToast({
        variant: "error",
        title: "Could not update rule",
        description:
          toggleError instanceof Error
            ? toggleError.message
            : "Please try again.",
      });
    } finally {
      setBusyRuleId(null);
    }
  }

  async function handleMoveRule(rule: RuleListItem, direction: "up" | "down") {
    if (!data || isReorderLocked) {
      return;
    }

    const currentIndex = data.rules.findIndex(
      (currentRule) => currentRule.id === rule.id,
    );
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (
      currentIndex === -1 ||
      targetIndex < 0 ||
      targetIndex >= data.rules.length
    ) {
      return;
    }

    const previousData = data;
    const nextRules = [...data.rules];
    [nextRules[currentIndex], nextRules[targetIndex]] = [
      nextRules[targetIndex],
      nextRules[currentIndex],
    ];

    setBusyRuleId(rule.id);
    setData({
      ...data,
      rules: nextRules.map((currentRule, index) => ({
        ...currentRule,
        priority: index + 1,
      })),
    });

    try {
      const response = await fetch(`/api/rules/${rule.id}/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction }),
      });
      const payload = await readResponse<
        RuleMoveResponse & { message?: string }
      >(response);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to reorder this rule.");
      }

      pushToast({
        variant: "success",
        title: "Order updated",
        description: `"${rule.keyword}" was moved ${direction}.`,
      });
      refreshRules();
    } catch (moveError) {
      setData(previousData);
      pushToast({
        variant: "error",
        title: "Could not change the order",
        description:
          moveError instanceof Error ? moveError.message : "Please try again.",
      });
    } finally {
      setBusyRuleId(null);
    }
  }

  function handleDeleteCompleted() {
    if (!data || !deleteRule) {
      refreshRules();
      return;
    }

    setData({
      ...data,
      rules: data.rules.filter((rule) => rule.id !== deleteRule.id),
      summary: {
        total: Math.max(0, data.summary.total - 1),
        active: Math.max(
          0,
          data.summary.active - (deleteRule.isActive ? 1 : 0),
        ),
        inactive: Math.max(
          0,
          data.summary.inactive - (deleteRule.isActive ? 0 : 1),
        ),
      },
      pagination: {
        ...data.pagination,
        totalItems: Math.max(0, data.pagination.totalItems - 1),
        endItem: Math.max(0, data.pagination.endItem - 1),
      },
    });

    if (selectedRuleId === deleteRule.id) {
      setSelectedRuleId(null);
    }

    refreshRules();
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.16fr_0.84fr]">
        <Card className="surface-glow overflow-hidden bg-[linear-gradient(180deg,rgba(14,22,38,0.92),rgba(8,13,24,0.95))]">
          <CardContent className="p-6 sm:p-7 lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-primary/15 bg-primary/10 text-primary">
                  Rules
                </Badge>
                <Badge className="border-white/[0.08] bg-white/[0.045] text-white/66">
                  Ready
                </Badge>
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                  Automatic
                  <span className="text-gradient"> replies</span>
                </h1>
                <p className="max-w-2xl text-sm text-white/48 sm:text-base">
                  Build the replies your customers need most.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-white/52">
                <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
                  Keyword
                </div>
                <span className="text-primary flex items-center">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
                  Match
                </div>
                <span className="text-primary flex items-center">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
                  Reply
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[linear-gradient(180deg,rgba(13,20,36,0.92),rgba(9,13,23,0.96))]">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="space-y-5">
              <div>
                <p className="text-[0.68rem] tracking-[0.22em] text-white/36 uppercase">
                  Example
                </p>
                <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Easy to scan.
                </h2>
              </div>

              <div className="space-y-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="border-primary/15 bg-primary/10 rounded-[18px] border px-4 py-3">
                  <p className="text-[0.68rem] tracking-[0.2em] text-white/38 uppercase">
                    Keyword
                  </p>
                  <p className="mt-2 text-sm font-semibold tracking-[-0.01em] text-white">
                    prix
                  </p>
                </div>
                <div className="text-primary flex justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                  <p className="text-[0.68rem] tracking-[0.2em] text-white/38 uppercase">
                    Reply
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Ask for the product name or photo.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="border-white/[0.08] bg-white/[0.045] text-white/66">
                Table
              </Badge>
              <Badge className="border-white/[0.08] bg-white/[0.045] text-white/66">
                Details
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Rules"
          value={summary.total}
          hint="Total"
          icon={Layers3}
          accentClassName="from-primary/28 via-primary/10 to-transparent"
        />
        <SummaryCard
          title="Active"
          value={summary.active}
          hint="Turned on"
          icon={Zap}
          accentClassName="from-emerald-300/20 via-emerald-200/8 to-transparent"
        />
        <SummaryCard
          title="Categories"
          value={categories.length}
          hint="Groups"
          icon={ListFilter}
          accentClassName="from-[#A855F7]/20 via-[#A855F7]/8 to-transparent"
        />
      </section>

      <RulesToolbar
        filters={filters}
        searchInput={searchInput}
        categories={categories}
        onSearchInputChange={(value) => setSearchInput(value)}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageSizeChange={handlePageSizeChange}
        onCreateRule={() => setEditorState({ mode: "create", rule: null })}
        isSyncing={isRefreshing}
        testHref="/dashboard/rules/test"
      />

      {isReorderLocked && currentRules.length > 0 ? (
        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white/48">
          To change the order, open the full list with no filters.
        </div>
      ) : null}

      {error && data ? (
        <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <RulesLoadingState />
      ) : error && !data ? (
        <RulesErrorState message={error} onRetry={refreshRules} />
      ) : currentRules.length === 0 ? (
        <RulesEmptyState
          isFiltered={isFiltered}
          onCreateRule={() => setEditorState({ mode: "create", rule: null })}
          onClearFilters={clearFilters}
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden items-start gap-5 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] xl:grid-cols-[minmax(0,1.22fr)_minmax(360px,0.78fr)]">
            <div className="space-y-4">
              <RulesTable
                rules={currentRules}
                selectedRuleId={selectedRuleId}
                onSelect={setSelectedRuleId}
              />
              <RulesPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>

            <RuleInspector
              rule={selectedRule}
              busyRuleId={busyRuleId}
              disableMove={isReorderLocked}
              totalRules={currentRules.length}
              currentIndex={selectedRuleIndex}
              onToggle={handleToggleRule}
              onMove={handleMoveRule}
              onEdit={(rule) => setEditorState({ mode: "edit", rule })}
              onDelete={(rule) => setDeleteRule(rule)}
            />
          </div>

          <div className="space-y-4 lg:hidden">
            <RulesCards
              rules={currentRules}
              busyRuleId={busyRuleId}
              disableMove={isReorderLocked}
              onToggle={handleToggleRule}
              onMove={handleMoveRule}
              onEdit={(rule) => setEditorState({ mode: "edit", rule })}
              onDelete={(rule) => setDeleteRule(rule)}
            />
            <RulesPagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      <RuleFormDialog
        open={Boolean(editorState)}
        mode={editorState?.mode ?? "create"}
        rule={editorState?.rule ?? null}
        nextPriority={summary.total + 1}
        onClose={() => setEditorState(null)}
        onCompleted={refreshRules}
      />

      <RuleDeleteDialog
        open={Boolean(deleteRule)}
        rule={deleteRule}
        onClose={() => setDeleteRule(null)}
        onCompleted={handleDeleteCompleted}
      />
    </div>
  );
}
