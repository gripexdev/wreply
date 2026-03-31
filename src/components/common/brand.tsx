import Image from "next/image";
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
    <Link
      href="/"
      aria-label="WReply"
      className={cn("inline-flex items-center gap-3.5", className)}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-[20px]",
          compact ? "h-11 w-11" : "h-[3.25rem] w-[3.25rem]",
        )}
      >
        <span className="absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_35%_30%,rgba(34,211,238,0.2),transparent_60%),radial-gradient(circle_at_75%_20%,rgba(168,85,247,0.18),transparent_48%)] blur-lg" />
        <Image
          src="/wreply-mark.svg"
          alt=""
          width={compact ? 42 : 54}
          height={compact ? 42 : 54}
          priority
          className={cn(
            "relative h-auto object-contain",
            compact ? "w-[42px]" : "w-[54px]",
          )}
        />
      </span>

      <span className="flex min-w-0 flex-col items-start">
        <span
          className={cn(
            "font-display leading-none font-semibold tracking-[-0.07em]",
            compact ? "text-[1.42rem]" : "text-[1.7rem]",
          )}
        >
          <span className="text-white">W</span>
          <span className="bg-[linear-gradient(135deg,#ffffff_0%,#dbeafe_20%,#93c5fd_48%,#67e8f9_78%,#c084fc_100%)] bg-clip-text text-transparent">
            Reply
          </span>
        </span>
        {!compact ? (
          <span className="mt-1.5 pl-0.5 text-[0.63rem] tracking-[0.22em] text-white/34 uppercase">
            WhatsApp replies
          </span>
        ) : null}
      </span>
    </Link>
  );
}
