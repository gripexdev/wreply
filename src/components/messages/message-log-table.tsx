import { ChevronRight, Link2, Radar, Sparkles } from "lucide-react";

import {
  getMessageLogOutcomeSummary,
  getMessageLogStatusSummary,
  MessageLogBadges,
} from "@/components/messages/message-log-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

function ConversationBubble({
  log,
}: Readonly<{
  log: MessageLogListItem;
}>) {
  return (
    <div
      className={cn(
        "max-w-[36rem] rounded-[30px] border px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        log.direction === "INBOUND"
          ? "border-[#3B82F6]/18 bg-[linear-gradient(180deg,rgba(18,40,68,0.74),rgba(10,20,35,0.96))] text-[#EFF6FF]"
          : "border-[#A855F7]/18 bg-[linear-gradient(180deg,rgba(36,28,74,0.76),rgba(14,16,36,0.98))] text-[#F5F3FF]",
      )}
    >
      <p className="text-[0.68rem] tracking-[0.2em] text-white/48 uppercase">
        {log.direction === "INBOUND" ? "Customer message" : "Outbound reply"}
      </p>
      <p className="mt-3 text-sm leading-7 text-current/95">
        {log.contentPreview}
      </p>
    </div>
  );
}

export function MessageLogTable({
  logs,
  onView,
}: Readonly<{
  logs: MessageLogListItem[];
  onView: (log: MessageLogListItem) => void;
}>) {
  return (
    <div className="hidden space-y-4 lg:block">
      {logs.map((log) => {
        const outcome = getMessageLogOutcomeSummary(log);
        const status = getMessageLogStatusSummary(log);

        return (
          <Card
            key={`${log.direction}-${log.id}`}
            className={cn(
              "overflow-hidden",
              log.direction === "INBOUND"
                ? "bg-[linear-gradient(180deg,rgba(8,17,31,0.96),rgba(7,12,22,0.98))]"
                : "bg-[linear-gradient(180deg,rgba(19,13,35,0.95),rgba(7,12,20,0.98))]",
            )}
          >
            <CardContent className="p-6 xl:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 space-y-3">
                  <MessageLogBadges log={log} />
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/84">
                    <span className="font-semibold text-white">
                      {log.contactName || log.contactPhone}
                    </span>
                    {log.contactName ? (
                      <span className="text-white/42">{log.contactPhone}</span>
                    ) : null}
                    <span className="text-white/32">•</span>
                    <span className="text-white/58">
                      {formatDateTime(log.timestamp)}
                    </span>
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

              <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-[28px] border border-white/[0.08] bg-black/18 p-5">
                  <div
                    className={cn(
                      "flex min-h-[14rem]",
                      log.direction === "INBOUND"
                        ? "items-start justify-start"
                        : "items-end justify-end",
                    )}
                  >
                    <ConversationBubble log={log} />
                  </div>

                  {log.relatedMessage ? (
                    <div className="mt-5 flex items-center gap-2 text-sm text-white/56">
                      <Link2 className="h-4 w-4" />
                      Linked {log.relatedMessage.direction.toLowerCase()}{" "}
                      message available in detail view
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.04]">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
                          Automation decision
                        </p>
                        <p className="mt-1 text-base font-semibold text-white">
                          {outcome.title}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      {outcome.description}
                    </p>
                    {log.processingReason || log.failureReason ? (
                      <div className="mt-4 rounded-[20px] border border-white/[0.08] bg-black/18 p-4 text-sm leading-6 text-white/74">
                        {log.processingReason || log.failureReason}
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.04]">
                        <Radar className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
                          Status signal
                        </p>
                        <p className="mt-1 text-sm leading-6 text-white/80">
                          {status}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-white/[0.08] bg-black/18 p-4">
                        <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                          Match source
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {log.matchedRule
                            ? log.matchedRule.keyword
                            : log.replySource === "AI_KNOWLEDGE"
                              ? "AI knowledge"
                              : log.replySource === "FALLBACK" ||
                                  log.fallbackUsed
                                ? "Fallback message"
                                : "No rule source"}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-white/[0.08] bg-black/18 p-4">
                        <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                          Reply state
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {log.direction === "OUTBOUND"
                            ? (log.sendStatus?.toLowerCase() ?? "prepared")
                            : (log.processingStatus
                                ?.replace("_", " ")
                                .toLowerCase() ?? "received")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
