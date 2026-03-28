import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({
  className,
  compact = false,
}: Readonly<{
  className?: string;
  compact?: boolean;
}>) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1eb58e] via-[#0f8fcb] to-[#7f56d9] text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(30,181,142,0.85)]">
        WR
      </span>
      <span className="space-y-0.5">
        <span className="font-display block text-lg font-semibold tracking-tight text-white">
          WReply
        </span>
        {!compact ? (
          <span className="text-muted-foreground block text-xs tracking-[0.22em] uppercase">
            WhatsApp SaaS Foundation
          </span>
        ) : null}
      </span>
    </Link>
  );
}
