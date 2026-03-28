import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

const directionBadgeStyles = {
  INBOUND: "border-sky-400/20 bg-sky-500/10 text-sky-100",
  OUTBOUND: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
} as const;

const processingBadgeStyles = {
  MATCHED: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  NO_MATCH: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  RECEIVED: "border-white/10 bg-white/[0.03] text-white",
  UNSUPPORTED: "border-white/10 bg-white/[0.03] text-white",
  DUPLICATE: "border-white/10 bg-white/[0.03] text-white",
  FAILED: "border-rose-400/20 bg-rose-500/10 text-rose-100",
} as const;

const sendBadgeStyles = {
  PREPARED: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  SENT: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  DELIVERED: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  FAILED: "border-rose-400/20 bg-rose-500/10 text-rose-100",
} as const;

export function MessageLogBadges({
  log,
  compact = false,
}: Readonly<{
  log: MessageLogListItem;
  compact?: boolean;
}>) {
  return (
    <div className={cn("flex flex-wrap gap-2", compact ? "gap-1.5" : "")}>
      <Badge className={directionBadgeStyles[log.direction]}>
        {log.direction.toLowerCase()}
      </Badge>

      {log.direction === "INBOUND" && log.processingStatus ? (
        <Badge
          className={
            processingBadgeStyles[
              log.processingStatus as keyof typeof processingBadgeStyles
            ] ?? "border-white/10 bg-white/[0.03] text-white"
          }
        >
          {log.processingStatus === "NO_MATCH" ? "no match" : log.processingStatus.toLowerCase()}
        </Badge>
      ) : null}

      {log.direction === "OUTBOUND" && log.sendStatus ? (
        <Badge
          className={
            sendBadgeStyles[log.sendStatus as keyof typeof sendBadgeStyles] ??
            "border-white/10 bg-white/[0.03] text-white"
          }
        >
          {log.sendStatus.toLowerCase()}
        </Badge>
      ) : null}

      {log.replySource === "FALLBACK" || log.fallbackUsed ? (
        <Badge className="border-amber-400/20 bg-amber-500/10 text-amber-100">
          fallback
        </Badge>
      ) : null}

      {log.replySource === "RULE_MATCH" ? (
        <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-100">
          rule reply
        </Badge>
      ) : null}
    </div>
  );
}
