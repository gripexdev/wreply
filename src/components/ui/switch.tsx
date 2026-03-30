"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: Readonly<{
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-8 w-[3.35rem] shrink-0 items-center rounded-full border p-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-primary/30 bg-[linear-gradient(135deg,rgba(68,216,180,0.9),rgba(47,143,255,0.92))] shadow-[0_18px_34px_-20px_rgba(47,143,255,0.7)]"
          : "border-white/[0.09] bg-[linear-gradient(180deg,rgba(21,29,46,0.9),rgba(12,17,28,0.92))]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 rounded-full bg-white shadow-[0_6px_18px_-10px_rgba(0,0,0,0.85)] transition-transform duration-200",
          checked ? "translate-x-[1.3rem]" : "translate-x-0",
        )}
      />
    </button>
  );
}
