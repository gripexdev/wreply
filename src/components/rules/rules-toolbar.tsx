"use client";

import Link from "next/link";
import { Plus, Search, Sparkles } from "lucide-react";

import { Button, buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ruleLanguageFilterOptions,
  ruleMatchTypeFilterOptions,
  ruleStatusOptions,
} from "@/config/rules";
import type { RulesQueryState } from "@/types/rules";

export function RulesToolbar({
  filters,
  searchInput,
  categories,
  onSearchInputChange,
  onFilterChange,
  onCreateRule,
  isSyncing,
  testHref,
}: Readonly<{
  filters: RulesQueryState;
  searchInput: string;
  categories: string[];
  onSearchInputChange: (value: string) => void;
  onFilterChange: (
    key: keyof Omit<RulesQueryState, "search">,
    value: string,
  ) => void;
  onCreateRule: () => void;
  isSyncing: boolean;
  testHref?: string;
}>) {
  return (
    <div className="sticky top-[5.6rem] z-20 rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,18,32,0.94),rgba(8,12,22,0.97))] p-4 shadow-[0_26px_90px_-62px_rgba(0,0,0,0.96)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[0.68rem] tracking-[0.24em] text-white/36 uppercase">
              Filters
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-sm text-white/58">Rules and search.</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs tracking-[0.2em] text-white/48 uppercase">
                <Sparkles className="text-primary h-3.5 w-3.5" />
                {isSyncing ? "Syncing" : "Live"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {testHref ? (
              <Link
                href={testHref}
                className={buttonStyles({ variant: "secondary" })}
              >
                Test messages
              </Link>
            ) : null}
            <Button onClick={onCreateRule}>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/38" />
            <Input
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Search trigger keywords or reply blocks"
              className="pl-11"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Select
              value={filters.status}
              onChange={(event) => onFilterChange("status", event.target.value)}
            >
              {ruleStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.language}
              onChange={(event) =>
                onFilterChange("language", event.target.value)
              }
            >
              {ruleLanguageFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.matchType}
              onChange={(event) =>
                onFilterChange("matchType", event.target.value)
              }
            >
              {ruleMatchTypeFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.category}
              onChange={(event) =>
                onFilterChange("category", event.target.value)
              }
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
