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
      <span className="surface-glow relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(15,22,40,0.96),rgba(8,12,23,0.92))] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_42px_-26px_rgba(0,0,0,0.92)]">
        <span className="text-gradient text-sm font-black tracking-[-0.08em]">
          WR
        </span>
      </span>
      <span className="space-y-0.5">
        <span className="font-display block text-lg font-semibold tracking-[-0.03em] text-white">
          WReply
        </span>
        {!compact ? (
          <span className="block text-[0.66rem] tracking-[0.24em] text-white/36 uppercase">
            WhatsApp replies
          </span>
        ) : null}
      </span>
    </Link>
  );
}
