"use client";

import Link from "next/link";
import { Search } from "lucide-react";

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
    <div className="sticky top-[5.6rem] z-20 rounded-[28px] border border-white/10 bg-[#0a1220]/92 p-4 shadow-[0_25px_100px_-70px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <Input
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Search by content or contact"
              className="pl-11"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Select
              value={filters.direction}
              onChange={(event) =>
                onFilterChange("direction", event.target.value)
              }
            >
              {messageLogDirectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.outcome}
              onChange={(event) => onFilterChange("outcome", event.target.value)}
            >
              {messageLogOutcomeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.sendStatus}
              onChange={(event) =>
                onFilterChange("sendStatus", event.target.value)
              }
            >
              {messageLogSendStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.fallback}
              onChange={(event) => onFilterChange("fallback", event.target.value)}
            >
              {messageLogFallbackOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.dateRange}
              onChange={(event) =>
                onFilterChange("dateRange", event.target.value)
              }
            >
              {messageLogDateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 xl:justify-end">
          <div className="text-muted-foreground text-sm">
            {isSyncing ? "Refreshing activity..." : "Filters synced with URL"}
          </div>
          {settingsHref ? (
            <Link
              href={settingsHref}
              className={buttonStyles({ variant: "secondary" })}
            >
              Business settings
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
