import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";
import type { RuleListItem } from "@/types/rules";

import { RuleActions } from "./rule-actions";
import {
  RuleLanguageBadge,
  RuleMatchTypeBadge,
  RuleStatusBadge,
} from "./rule-badges";

export function RulesTable({
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
    <Card className="hidden overflow-hidden lg:block">
      <CardContent className="p-0">
        <div className="text-muted-foreground grid grid-cols-[1.15fr_1.65fr_0.8fr_0.8fr_0.58fr_0.72fr_0.78fr_1.2fr] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold tracking-[0.2em] uppercase">
          <span>Keyword</span>
          <span>Reply</span>
          <span>Match</span>
          <span>Language</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Updated</span>
          <span className="text-right">Actions</span>
        </div>

        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className="grid grid-cols-[1.15fr_1.65fr_0.8fr_0.8fr_0.58fr_0.72fr_0.78fr_1.2fr] gap-4 border-b border-white/6 px-6 py-5 transition last:border-b-0 hover:bg-white/[0.025]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {rule.keyword}
              </p>
              <p className="text-muted-foreground mt-2 truncate text-sm">
                {rule.category ?? "No category"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="[display:-webkit-box] overflow-hidden text-sm leading-6 text-white/88 [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {rule.replyMessage}
              </p>
            </div>

            <div className="flex items-start">
              <RuleMatchTypeBadge matchType={rule.matchType} />
            </div>

            <div className="flex items-start">
              <RuleLanguageBadge language={rule.language} />
            </div>

            <div className="text-sm font-semibold text-white">
              #{rule.priority}
            </div>

            <div className="flex items-start">
              <RuleStatusBadge isActive={rule.isActive} />
            </div>

            <div className="text-muted-foreground text-sm">
              {formatShortDate(rule.updatedAt)}
            </div>

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
        ))}
      </CardContent>
    </Card>
  );
}
