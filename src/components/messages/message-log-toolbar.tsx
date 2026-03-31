"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  messageLogDateRangeOptions,
  messageLogDirectionOptions,
  messageLogFallbackOptions,
  messageLogOutcomeOptions,
  messageLogSendStatusOptions,
} from "@/config/message-logs";
import type { MessageLogsQueryState } from "@/types/message-logs";

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}>) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-3">
      <p className="text-[0.64rem] tracking-[0.2em] text-white/40 uppercase">
        {label}
      </p>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      >
        {children}
      </Select>
    </div>
  );
}

export function MessageLogToolbar({
  filters,
  searchInput,
  isSyncing,
  onSearchInputChange,
  onFilterChange,
  settingsHref,
}: Readonly<{
  filters: MessageLogsQueryState;
  searchInput: string;
  isSyncing: boolean;
  onSearchInputChange: (value: string) => void;
  onFilterChange: (
    key: keyof Omit<MessageLogsQueryState, "search">,
    value: string,
  ) => void;
  settingsHref?: string;
}>) {
  return (
    <div className="sticky top-[5.6rem] z-20 rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,16,28,0.95),rgba(8,12,22,0.98))] p-4 shadow-[0_28px_110px_-72px_rgba(0,0,0,1)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.04]">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.68rem] tracking-[0.22em] text-white/40 uppercase">
                  Filters
                </p>
                <p className="text-sm text-white/58">Message history.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/62">
              {isSyncing ? "Updating" : "Ready"}
            </div>
            {settingsHref ? (
              <Link
                href={settingsHref}
                className={buttonStyles({ variant: "secondary" })}
              >
                Settings
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.45fr_0.82fr_0.82fr_0.82fr_0.82fr_0.82fr]">
          <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-3 sm:p-4">
            <p className="text-[0.64rem] tracking-[0.2em] text-white/40 uppercase">
              Search
            </p>
            <div className="relative mt-2">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder="Search message content or contact"
                className="pl-11"
              />
            </div>
          </div>

          <FilterSelect
            label="Type"
            value={filters.direction}
            onChange={(value) => onFilterChange("direction", value)}
          >
            {messageLogDirectionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Outcome"
            value={filters.outcome}
            onChange={(value) => onFilterChange("outcome", value)}
          >
            {messageLogOutcomeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Reply status"
            value={filters.sendStatus}
            onChange={(value) => onFilterChange("sendStatus", value)}
          >
            {messageLogSendStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Default reply"
            value={filters.fallback}
            onChange={(value) => onFilterChange("fallback", value)}
          >
            {messageLogFallbackOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Date range"
            value={filters.dateRange}
            onChange={(value) => onFilterChange("dateRange", value)}
          >
            {messageLogDateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>
    </div>
  );
}
