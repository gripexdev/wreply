import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";
import type { RuleListItem } from "@/types/rules";

import { RuleActions } from "./rule-actions";
import {
  RuleLanguageBadge,
  RuleMatchTypeBadge,
  RuleStatusBadge,
} from "./rule-badges";

export function RulesCards({
  rules,
  busyRuleId,
  disableMove,
  onToggle,
  onMove,
  onEdit,
  onDelete,
}: Readonly<{
  rules: RuleListItem[];
  busyRuleId: string | null;
  disableMove?: boolean;
  onToggle: (rule: RuleListItem, nextValue: boolean) => void;
  onMove: (rule: RuleListItem, direction: "up" | "down") => void;
  onEdit: (rule: RuleListItem) => void;
  onDelete: (rule: RuleListItem) => void;
}>) {
  return (
    <div className="space-y-4 lg:hidden">
      {rules.map((rule, index) => (
        <Card key={rule.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">
                  {rule.keyword}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {rule.category ?? "No category"}
                </p>
              </div>
              <RuleStatusBadge isActive={rule.isActive} />
            </div>

            <p className="mt-4 [display:-webkit-box] overflow-hidden text-sm leading-6 text-white/88 [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {rule.replyMessage}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <RuleMatchTypeBadge matchType={rule.matchType} />
              <RuleLanguageBadge language={rule.language} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  Priority
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  #{rule.priority}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  Updated
                </p>
                <p className="mt-1 text-sm text-white">
                  {formatShortDate(rule.updatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <RuleActions
                isActive={rule.isActive}
                isBusy={busyRuleId === rule.id}
                isFirst={index === 0}
                isLast={index === rules.length - 1}
                disableMove={disableMove}
                onToggle={(nextValue) => onToggle(rule, nextValue)}
                onMoveUp={() => onMove(rule, "up")}
                onMoveDown={() => onMove(rule, "down")}
                onEdit={() => onEdit(rule)}
                onDelete={() => onDelete(rule)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
