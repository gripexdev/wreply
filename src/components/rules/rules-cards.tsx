import type { ComponentType, ReactNode } from "react";
import { ArrowRight, MessageSquareReply, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";
import type { RuleListItem } from "@/types/rules";

import { RuleActions } from "./rule-actions";
import {
  RuleLanguageBadge,
  RuleMatchTypeBadge,
  RuleStatusBadge,
} from "./rule-badges";

function LogicPanel({
  label,
  icon: Icon,
  children,
}: Readonly<{
  label: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}>) {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(15,22,38,0.92),rgba(9,14,25,0.94))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center gap-3">
        <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03]">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[0.68rem] tracking-[0.22em] text-white/40 uppercase">
          {label}
        </p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

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
    <div className="grid gap-5 xl:grid-cols-2">
      {rules.map((rule, index) => (
        <Card
          key={rule.id}
          className="overflow-hidden bg-[linear-gradient(180deg,rgba(13,20,36,0.94),rgba(8,13,24,0.97))]"
        >
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-primary/15 bg-primary/10 text-primary">
                    Rule #{rule.priority}
                  </Badge>
                  {rule.category ? (
                    <Badge className="border-white/[0.08] bg-white/[0.045] text-white/66">
                      {rule.category}
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                    Trigger keyword
                  </p>
                  <h3 className="font-display mt-2 truncate text-2xl font-semibold tracking-[-0.04em] text-white">
                    {rule.keyword}
                  </h3>
                </div>
              </div>

              <RuleStatusBadge isActive={rule.isActive} />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.1fr)] xl:items-center">
              <LogicPanel label="Trigger block" icon={Sparkles}>
                <div className="border-primary/15 bg-primary/10 rounded-[20px] border px-4 py-4">
                  <p className="font-display text-xl font-semibold tracking-[-0.03em] text-white">
                    {rule.keyword}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    Watches incoming messages for this keyword or phrase.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <RuleMatchTypeBadge matchType={rule.matchType} />
                  <RuleLanguageBadge language={rule.language} />
                </div>
              </LogicPanel>

              <div className="flex items-center justify-center">
                <span className="text-primary flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>

              <LogicPanel label="Reply block" icon={MessageSquareReply}>
                <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-4">
                  <p className="[display:-webkit-box] overflow-hidden text-sm leading-7 text-white/88 [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
                    {rule.replyMessage}
                  </p>
                </div>
              </LogicPanel>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                    Updated
                  </p>
                  <p className="mt-2 text-sm font-semibold tracking-[-0.01em] text-white">
                    {formatShortDate(rule.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs tracking-[0.2em] text-white/50 uppercase">
                  <Zap className="text-primary h-3.5 w-3.5" />
                  {disableMove ? "Reorder locked" : "Priority active"}
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
