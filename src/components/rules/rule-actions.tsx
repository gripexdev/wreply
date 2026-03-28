"use client";

import { ArrowDown, ArrowUp, LoaderCircle, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

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
    <div className="flex flex-wrap items-center justify-end gap-2">
      {isBusy ? (
        <span className="text-muted-foreground flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <LoaderCircle className="h-4 w-4 animate-spin" />
        </span>
      ) : null}
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={isBusy}
        aria-label={isActive ? "Disable rule" : "Enable rule"}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isBusy || isFirst || disableMove}
        onClick={onMoveUp}
        aria-label="Move rule up"
        title={disableMove ? "Clear filters to reorder rules" : "Move rule up"}
        className="rounded-2xl border border-white/10 bg-white/5"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isBusy || isLast || disableMove}
        onClick={onMoveDown}
        aria-label="Move rule down"
        title={
          disableMove ? "Clear filters to reorder rules" : "Move rule down"
        }
        className="rounded-2xl border border-white/10 bg-white/5"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isBusy}
        onClick={onEdit}
        aria-label="Edit rule"
        className="rounded-2xl border border-white/10 bg-white/5"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isBusy}
        onClick={onDelete}
        aria-label="Delete rule"
        className="rounded-2xl border border-white/10 bg-white/5 text-rose-200 hover:text-rose-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
