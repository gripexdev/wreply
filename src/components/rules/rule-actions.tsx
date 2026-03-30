"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, LoaderCircle, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

function ActionIconButton({
  label,
  disabled,
  onClick,
  children,
  tone = "default",
}: Readonly<{
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: "default" | "danger";
}>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        tone === "danger"
          ? "h-10 w-10 rounded-[16px] border border-rose-300/12 bg-rose-400/6 text-rose-100 hover:border-rose-300/20 hover:bg-rose-400/10"
          : "h-10 w-10 rounded-[16px] border border-white/[0.08] bg-white/[0.03] text-white/72 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
      }
    >
      {children}
    </Button>
  );
}

export function RuleActions({
  isActive,
  isBusy,
  isFirst,
  isLast,
  disableMove,
  onToggle,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: Readonly<{
  isActive: boolean;
  isBusy: boolean;
  isFirst: boolean;
  isLast: boolean;
  disableMove?: boolean;
  onToggle: (nextValue: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}>) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          disabled={isBusy}
          aria-label={isActive ? "Disable rule" : "Enable rule"}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[-0.01em] text-white">
            {isActive ? "Rule is live" : "Rule is paused"}
          </p>
          <p className="text-xs leading-5 text-white/46">
            {isActive
              ? "The matcher can use this logic block."
              : "The matcher ignores this rule until you enable it again."}
          </p>
        </div>
        {isBusy ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.04] text-white/58">
            <LoaderCircle className="h-4 w-4 animate-spin" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-1">
          <ActionIconButton
            label={
              disableMove ? "Clear filters to reorder rules" : "Move rule up"
            }
            disabled={isBusy || isFirst || disableMove}
            onClick={onMoveUp}
          >
            <ArrowUp className="h-4 w-4" />
          </ActionIconButton>
          <ActionIconButton
            label={
              disableMove ? "Clear filters to reorder rules" : "Move rule down"
            }
            disabled={isBusy || isLast || disableMove}
            onClick={onMoveDown}
          >
            <ArrowDown className="h-4 w-4" />
          </ActionIconButton>
        </div>

        <div className="flex items-center gap-2 rounded-[18px] border border-white/[0.08] bg-white/[0.03] p-1">
          <ActionIconButton
            label="Edit rule"
            disabled={isBusy}
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </ActionIconButton>
          <ActionIconButton
            label="Delete rule"
            disabled={isBusy}
            onClick={onDelete}
            tone="danger"
          >
            <Trash2 className="h-4 w-4" />
          </ActionIconButton>
        </div>
      </div>
    </div>
  );
}
