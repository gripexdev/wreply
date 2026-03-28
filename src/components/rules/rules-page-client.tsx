"use client";

import { Layers3, ListFilter, Zap } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { RuleDeleteDialog } from "@/components/rules/rule-delete-dialog";
import { RuleFormDialog } from "@/components/rules/rule-form-dialog";
import { RulesCards } from "@/components/rules/rules-cards";
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
  RulesListResponse,
  RulesQueryState,
} from "@/types/rules";

function readFilters(searchParams: URLSearchParams) {
  const parsed = rulesQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    matchType: searchParams.get("matchType") ?? undefined,
    category: searchParams.get("category") ?? undefined,
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
          throw new Error(payload?.message ?? "Unable to load your rules.");
        }

        setData(payload);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your rules.",
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

  const currentRules = data?.rules ?? [];
  const summary = data?.summary ?? { total: 0, active: 0, inactive: 0 };
  const categories = data?.categories ?? [];
  const isFiltered = isFilteredView(filters);
  const isReorderLocked = isFiltered;

  function refreshRules() {
    setReloadToken((currentValue) => currentValue + 1);
  }

  function handleFilterChange(
    key: keyof Omit<RulesQueryState, "search">,
    value: string,
  ) {
    setFilters((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
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
        title: nextValue ? "Rule enabled" : "Rule disabled",
        description: `"${rule.keyword}" was updated successfully.`,
      });

      refreshRules();
    } catch (toggleError) {
      setData(previousData);
      pushToast({
        variant: "error",
        title: "Unable to update rule",
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
        title: "Priority updated",
        description: `"${rule.keyword}" was moved ${direction}.`,
      });
      refreshRules();
    } catch (moveError) {
      setData(previousData);
      pushToast({
        variant: "error",
        title: "Unable to reorder rule",
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
    });
    refreshRules();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Rules management
                </Badge>
                <h1 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  Auto-reply rules
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-base">
                  Create clear rule coverage for pricing, store details,
                  delivery, stock checks, and other frequent WhatsApp questions.
                </p>
              </div>

              <div className="text-muted-foreground rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                {isRefreshing
                  ? "Refreshing rules..."
                  : "Workspace-scoped rules only"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                Priority system
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                Lower priority numbers appear first. Reordering is available on
                the full list so the workspace keeps a reliable global sequence.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="border-white/10 bg-white/[0.03] text-white">
                Exact and contains
              </Badge>
              <Badge className="border-white/10 bg-white/[0.03] text-white">
                Darija and French ready
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total rules"
          value={summary.total}
          description="All rules in the current workspace, regardless of filters."
          icon={Layers3}
        />
        <SummaryCard
          title="Active rules"
          value={summary.active}
          description="Enabled rules that stay available for future matching."
          icon={Zap}
        />
        <SummaryCard
          title="Tracked categories"
          value={categories.length}
          description="Optional labels used for cleaner organization and filtering."
          icon={ListFilter}
        />
      </section>

      <RulesToolbar
        filters={filters}
        searchInput={searchInput}
        categories={categories}
        onSearchInputChange={(value) => setSearchInput(value)}
        onFilterChange={handleFilterChange}
        onCreateRule={() => setEditorState({ mode: "create", rule: null })}
        isSyncing={isRefreshing}
        testHref="/dashboard/rules/test"
      />

      {isReorderLocked ? (
        <div className="text-muted-foreground rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          Clear search and filters to reorder priorities. Priority changes are
          scoped to the full workspace list.
        </div>
      ) : null}

      {error && data ? (
        <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
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
        <>
          <RulesTable
            rules={currentRules}
            busyRuleId={busyRuleId}
            disableMove={isReorderLocked}
            onToggle={handleToggleRule}
            onMove={handleMoveRule}
            onEdit={(rule) => setEditorState({ mode: "edit", rule })}
            onDelete={(rule) => setDeleteRule(rule)}
          />
          <RulesCards
            rules={currentRules}
            busyRuleId={busyRuleId}
            disableMove={isReorderLocked}
            onToggle={handleToggleRule}
            onMove={handleMoveRule}
            onEdit={(rule) => setEditorState({ mode: "edit", rule })}
            onDelete={(rule) => setDeleteRule(rule)}
          />
        </>
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
