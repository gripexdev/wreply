"use client";

import { ChevronRight } from "lucide-react";

import {
  RuleLanguageBadge,
  RuleMatchTypeBadge,
  RuleStatusBadge,
} from "@/components/rules/rule-badges";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatShortDate, truncateText } from "@/lib/utils";
import type { RuleListItem } from "@/types/rules";

export function RulesTable({
  rules,
  selectedRuleId,
  onSelect,
}: Readonly<{
  rules: RuleListItem[];
  selectedRuleId: string | null;
  onSelect: (ruleId: string) => void;
}>) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(13,20,36,0.94),rgba(8,13,24,0.98))]">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left">
                <th className="px-6 py-4 text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                  Rule
                </th>
                <th className="px-6 py-4 text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                  Reply
                </th>
                <th className="px-6 py-4 text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                  Match
                </th>
                <th className="px-6 py-4 text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                  Priority
                </th>
                <th className="px-6 py-4 text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                  Updated
                </th>
                <th className="px-6 py-4 text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const isSelected = rule.id === selectedRuleId;

                return (
                  <tr
                    key={rule.id}
                    className={cn(
                      "transition-colors duration-200",
                      isSelected
                        ? "bg-[linear-gradient(90deg,rgba(59,130,246,0.10),rgba(34,211,238,0.03),transparent)]"
                        : "hover:bg-white/[0.03]",
                    )}
                  >
                    <td className="border-b border-white/[0.06] px-6 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => onSelect(rule.id)}
                        className="w-full min-w-0 space-y-2 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold tracking-[-0.02em] text-white">
                            {rule.keyword}
                          </p>
                          {rule.category ? (
                            <span className="rounded-full border border-white/[0.08] bg-white/[0.045] px-2.5 py-1 text-[0.68rem] tracking-[0.12em] text-white/48 uppercase">
                              {rule.category}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-white/38">Trigger phrase</p>
                      </button>
                    </td>
                    <td className="border-b border-white/[0.06] px-6 py-4 align-top">
                      <p className="max-w-[25rem] text-sm leading-6 text-white/64">
                        {truncateText(rule.replyMessage, 118)}
                      </p>
                    </td>
                    <td className="border-b border-white/[0.06] px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <RuleMatchTypeBadge matchType={rule.matchType} />
                        <RuleLanguageBadge language={rule.language} />
                      </div>
                    </td>
                    <td className="border-b border-white/[0.06] px-6 py-4 align-top">
                      <RuleStatusBadge isActive={rule.isActive} />
                    </td>
                    <td className="border-b border-white/[0.06] px-6 py-4 align-top">
                      <span className="inline-flex min-w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm font-semibold text-white">
                        {rule.priority}
                      </span>
                    </td>
                    <td className="border-b border-white/[0.06] px-6 py-4 align-top text-sm text-white/52">
                      {formatShortDate(rule.updatedAt)}
                    </td>
                    <td className="border-b border-white/[0.06] px-6 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => onSelect(rule.id)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs tracking-[0.14em] uppercase transition-colors",
                          isSelected
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-white/[0.08] bg-white/[0.03] text-white/48",
                        )}
                      >
                        Inspect
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
