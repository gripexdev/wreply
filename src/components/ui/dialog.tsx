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
        className="absolute inset-0 bg-[#030712]/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#09111d]/96 shadow-[0_45px_140px_-60px_rgba(0,0,0,1)]",
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
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm leading-6">{description}</p>
      </div>
      <button
        type="button"
        aria-label="Close dialog"
        className="text-muted-foreground flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10 hover:text-white"
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
