import { ArrowRight, ChevronRight } from "lucide-react";

import { MessageLogBadges } from "@/components/messages/message-log-badges";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

export function MessageLogTable({
  logs,
  onView,
}: Readonly<{
  logs: MessageLogListItem[];
  onView: (log: MessageLogListItem) => void;
}>) {
  return (
    <div className="hidden overflow-hidden rounded-[28px] border border-white/10 bg-[#0a1220]/78 shadow-[0_25px_100px_-65px_rgba(0,0,0,0.95)] lg:block">
      <div className="grid grid-cols-[0.9fr_1fr_1.4fr_1.2fr_1.1fr_0.9fr_0.6fr] gap-4 border-b border-white/10 px-6 py-4 text-xs tracking-[0.2em] uppercase text-white/50">
        <span>Direction</span>
        <span>Contact</span>
        <span>Preview</span>
        <span>Outcome</span>
        <span>Status</span>
        <span>Time</span>
        <span />
      </div>

      {logs.map((log) => (
        <div
          key={`${log.direction}-${log.id}`}
          className="grid grid-cols-[0.9fr_1fr_1.4fr_1.2fr_1.1fr_0.9fr_0.6fr] gap-4 border-b border-white/6 px-6 py-5 last:border-b-0"
        >
          <div className="space-y-3">
            <MessageLogBadges log={log} compact />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              {log.contactName || log.contactPhone}
            </p>
            {log.contactName ? (
              <p className="text-muted-foreground text-sm">{log.contactPhone}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="max-h-12 overflow-hidden text-sm leading-6 text-white/90">
              {log.contentPreview}
            </p>
            {log.relatedMessage ? (
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <ArrowRight className="h-3.5 w-3.5" />
                Linked {log.relatedMessage.direction.toLowerCase()} reply
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              {log.matchedRule
                ? `Rule: ${log.matchedRule.keyword}`
                : log.fallbackUsed || log.replySource === "FALLBACK"
                  ? "Fallback reply"
                  : "No rule match"}
            </p>
            <p className="text-muted-foreground max-h-12 overflow-hidden text-sm leading-6">
              {log.processingReason || log.failureReason || "No extra details yet."}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              {log.direction === "INBOUND"
                ? log.processingStatus?.replace("_", " ").toLowerCase() ??
                  "received"
                : log.sendStatus?.toLowerCase() ?? "prepared"}
            </p>
            <p className="text-muted-foreground text-sm">
              {log.replySource === "FALLBACK"
                ? "Fallback origin"
                : log.replySource === "RULE_MATCH"
                  ? "Rule origin"
                  : log.fallbackEligible
                    ? "Fallback eligible"
                    : "No fallback"}
            </p>
          </div>

          <div className="text-muted-foreground text-sm leading-6">
            {formatDateTime(log.timestamp)}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" size="icon" onClick={() => onView(log)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
