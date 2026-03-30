"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  panelClassName,
  children,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  panelClassName?: string;
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[rgba(3,6,14,0.76)] backdrop-blur-md"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "panel-sheen bg-card-strong relative z-10 w-full max-w-2xl overflow-hidden rounded-[34px] border border-white/[0.08] shadow-[0_40px_140px_-70px_rgba(0,0,0,1),0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-2xl",
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return <div className={cn("p-6 sm:p-8", className)}>{children}</div>;
}

export function DialogHeader({
  title,
  description,
  onClose,
}: Readonly<{
  title: string;
  description: string;
  onClose: () => void;
}>) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <h2 className="font-display text-[1.85rem] font-semibold tracking-[-0.04em] text-white">
          {title}
        </h2>
        <p className="text-muted-foreground text-[0.95rem] leading-6">
          {description}
        </p>
      </div>
      <button
        type="button"
        aria-label="Close dialog"
        className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04] text-white/68 transition hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DialogFooter({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
