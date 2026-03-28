"use client";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
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
}>) {
  return (
    <div className="sticky top-[5.6rem] z-20 rounded-[28px] border border-white/10 bg-[#0a1220]/92 p-4 shadow-[0_25px_100px_-70px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <Input
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Search by keyword or reply text"
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
        <div className="flex items-center justify-between gap-4 xl:justify-end">
          <div className="text-muted-foreground text-sm">
            {isSyncing ? "Updating filters..." : "Filters synced with URL"}
          </div>
          <Button onClick={onCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>
    </div>
  );
}
