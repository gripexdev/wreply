"use client";

import {
  ArrowDown,
  ArrowRight,
  MessageSquareReply,
  Sparkles,
} from "lucide-react";

import { RuleActions } from "@/components/rules/rule-actions";
import {
  RuleLanguageBadge,
  RuleMatchTypeBadge,
  RuleStatusBadge,
} from "@/components/rules/rule-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";
import type { RuleListItem } from "@/types/rules";

function DetailBlock({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-[0.68rem] tracking-[0.18em] text-white/34 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white/78">{value}</p>
    </div>
  );
}

export function RuleInspector({
  rule,
  busyRuleId,
  disableMove,
  totalRules,
  currentIndex,
  onToggle,
  onMove,
  onEdit,
  onDelete,
}: Readonly<{
  rule: RuleListItem | null;
  busyRuleId: string | null;
  disableMove: boolean;
  totalRules: number;
  currentIndex: number;
  onToggle: (rule: RuleListItem, nextValue: boolean) => void;
  onMove: (rule: RuleListItem, direction: "up" | "down") => void;
  onEdit: (rule: RuleListItem) => void;
  onDelete: (rule: RuleListItem) => void;
}>) {
  if (!rule) {
    return (
      <Card className="self-start bg-[linear-gradient(180deg,rgba(13,20,36,0.94),rgba(8,13,24,0.98))]">
        <CardContent className="p-6">
          <div className="flex min-h-[32rem] items-center justify-center rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.025] px-6 text-center">
            <div className="space-y-3">
              <div className="text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pick a rule</p>
                <p className="mt-1 text-sm text-white/44">
                  Select any row to view the details.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-[6.5rem] self-start bg-[linear-gradient(180deg,rgba(13,20,36,0.96),rgba(8,13,24,0.99))] lg:max-h-[calc(100vh-8rem)]">
      <CardContent className="overflow-y-auto p-6 lg:max-h-[calc(100vh-8rem)]">
        <div className="space-y-6 pr-1">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/15 bg-primary/10 text-primary">
                Rule #{rule.priority}
              </Badge>
              {rule.category ? (
                <Badge className="border-white/[0.08] bg-white/[0.045] text-white/66">
                  {rule.category}
                </Badge>
              ) : null}
              <RuleStatusBadge isActive={rule.isActive} />
            </div>

            <div>
              <p className="text-[0.68rem] tracking-[0.2em] text-white/36 uppercase">
                Selected
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                {rule.keyword}
              </h2>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="space-y-3">
              <div className="border-primary/12 bg-primary/10 rounded-[22px] border p-4">
                <div className="flex items-center gap-3">
                  <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.04]">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.68rem] tracking-[0.18em] text-white/34 uppercase">
                      Keyword
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">
                      {rule.keyword}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-primary flex justify-center">
                <ArrowDown className="h-4 w-4" />
              </div>

              <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.04] text-[#A855F7]">
                    <MessageSquareReply className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.68rem] tracking-[0.18em] text-white/34 uppercase">
                      Reply
                    </p>
                    <p className="mt-1 text-sm leading-7 text-white/78">
                      {rule.replyMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailBlock
              label="Updated"
              value={formatShortDate(rule.updatedAt)}
            />
            <DetailBlock
              label="Position"
              value={`${currentIndex + 1} of ${totalRules}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <RuleMatchTypeBadge matchType={rule.matchType} />
            <RuleLanguageBadge language={rule.language} />
            <Badge className="border-white/[0.08] bg-white/[0.045] text-white/66">
              Priority {rule.priority}
            </Badge>
          </div>

          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-primary flex h-9 w-9 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.04]">
                <ArrowRight className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Actions</p>
                <p className="text-xs text-white/42">
                  Edit, pause, or reorder.
                </p>
              </div>
            </div>

            <RuleActions
              isActive={rule.isActive}
              isBusy={busyRuleId === rule.id}
              isFirst={currentIndex === 0}
              isLast={currentIndex === totalRules - 1}
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
  );
}
