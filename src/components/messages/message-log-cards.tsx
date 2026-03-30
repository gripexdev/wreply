import { ChevronRight, Link2, MessageSquareQuote } from "lucide-react";

import {
  getMessageLogOutcomeSummary,
  getMessageLogStatusSummary,
  MessageLogBadges,
} from "@/components/messages/message-log-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

function MessageBubble({
  log,
}: Readonly<{
  log: MessageLogListItem;
}>) {
  return (
    <div
      className={cn(
        "max-w-[92%] rounded-[28px] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        log.direction === "INBOUND"
          ? "border-[#3B82F6]/18 bg-[linear-gradient(180deg,rgba(20,44,74,0.72),rgba(12,23,40,0.92))] text-[#EFF6FF]"
          : "border-[#A855F7]/18 bg-[linear-gradient(180deg,rgba(38,28,74,0.74),rgba(18,14,36,0.96))] text-[#F5F3FF]",
      )}
    >
      <div className="flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-white/52 uppercase">
        <MessageSquareQuote className="h-3.5 w-3.5" />
        {log.direction === "INBOUND" ? "Customer message" : "Auto-reply"}
      </div>
      <p className="mt-3 text-sm leading-7 text-current/95">
        {log.contentPreview}
      </p>
    </div>
  );
}

export function MessageLogCards({
  logs,
  onView,
}: Readonly<{
  logs: MessageLogListItem[];
  onView: (log: MessageLogListItem) => void;
}>) {
  return (
    <div className="grid gap-4 lg:hidden">
      {logs.map((log) => {
        const outcome = getMessageLogOutcomeSummary(log);
        const status = getMessageLogStatusSummary(log);

        return (
          <Card
            key={`${log.direction}-${log.id}`}
            className={cn(
              "overflow-hidden",
              log.direction === "INBOUND"
                ? "bg-[linear-gradient(180deg,rgba(9,21,38,0.96),rgba(8,13,24,0.98))]"
                : "bg-[linear-gradient(180deg,rgba(20,14,37,0.94),rgba(9,12,22,0.98))]",
            )}
          >
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <MessageLogBadges log={log} />
                  <div>
                    <p className="truncate text-sm font-semibold text-white">
                      {log.contactName || log.contactPhone}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {log.contactName
                        ? log.contactPhone
                        : formatDateTime(log.timestamp)}
                    </p>
                    {log.contactName ? (
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(log.timestamp)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => onView(log)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div
                className={cn(
                  "flex",
                  log.direction === "INBOUND" ? "justify-start" : "justify-end",
                )}
              >
                <MessageBubble log={log} />
              </div>

              <div className="grid gap-3 rounded-[24px] border border-white/[0.08] bg-black/20 p-4">
                <div className="space-y-1">
                  <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
                    Automation decision
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {outcome.title}
                  </p>
                  <p className="text-sm leading-6 text-white/70">
                    {outcome.description}
                  </p>
                </div>

                <div className="grid gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4">
                  <div className="space-y-1">
                    <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
                      Status signal
                    </p>
                    <p className="text-sm leading-6 text-white/82">{status}</p>
                  </div>

                  {log.relatedMessage ? (
                    <div className="flex items-center gap-2 text-sm text-white/62">
                      <Link2 className="h-4 w-4" />
                      Linked {log.relatedMessage.direction.toLowerCase()}{" "}
                      activity available
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
