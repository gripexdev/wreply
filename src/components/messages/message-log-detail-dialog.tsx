"use client";

import {
  ArrowRight,
  Bot,
  CircleAlert,
  Clock3,
  Link2,
  MessageSquareText,
  Radar,
  Send,
  Sparkles,
} from "lucide-react";

import {
  getMessageLogOutcomeSummary,
  getMessageLogStatusSummary,
  MessageLogBadges,
} from "@/components/messages/message-log-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { cn, formatDateTime } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

function SectionField({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="space-y-1">
      <p className="text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
        {label}
      </p>
      <p className="text-sm leading-6 text-white/84">{value}</p>
    </div>
  );
}

function BubblePreview({
  log,
  content,
}: Readonly<{
  log: MessageLogListItem;
  content: string;
}>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border px-5 py-5",
        log.direction === "INBOUND"
          ? "border-[#3B82F6]/18 bg-[linear-gradient(180deg,rgba(18,41,70,0.74),rgba(10,19,35,0.96))] text-[#EFF6FF]"
          : "border-[#A855F7]/18 bg-[linear-gradient(180deg,rgba(37,28,76,0.76),rgba(14,16,36,0.98))] text-[#F5F3FF]",
      )}
    >
      <div className="flex items-center gap-2 text-[0.68rem] tracking-[0.2em] text-white/50 uppercase">
        <MessageSquareText className="h-3.5 w-3.5" />
        {log.direction === "INBOUND" ? "Customer message" : "Reply body"}
      </div>
      <p className="mt-3 text-sm leading-7 text-current/95">{content}</p>
    </div>
  );
}

export function MessageLogDetailDialog({
  log,
  onClose,
}: Readonly<{
  log: MessageLogListItem | null;
  onClose: () => void;
}>) {
  if (!log) {
    return null;
  }

  const outcome = getMessageLogOutcomeSummary(log);
  const status = getMessageLogStatusSummary(log);

  return (
    <Dialog open onClose={onClose} panelClassName="max-w-5xl">
      <DialogContent className="space-y-6">
        <DialogHeader
          title={
            log.direction === "INBOUND" ? "Customer message" : "Reply details"
          }
          description="View the message and what happened."
          onClose={onClose}
        />

        <div className="flex flex-col gap-4 rounded-[28px] border border-white/[0.08] bg-black/18 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <MessageLogBadges log={log} />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-white">
                {log.contactName || log.contactPhone}
              </p>
              <p className="text-sm text-white/58">
                {log.contactName ? log.contactPhone : "WhatsApp contact"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:min-w-[15rem]">
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                Time
              </p>
              <p className="mt-1 text-sm font-medium text-white/84">
                {formatDateTime(log.timestamp)}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                Result
              </p>
              <p className="mt-1 text-sm font-medium text-white/84">
                {outcome.title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <MessageSquareText className="text-primary h-5 w-5" />
                Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <BubblePreview
                log={log}
                content={log.content || "No message content was stored."}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <SectionField label="Contact" value={log.contactPhone} />
                <SectionField
                  label="WhatsApp ID"
                  value={log.providerMessageId || "Not recorded"}
                />
              </div>

              {log.normalizedContent ? (
                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                    Cleaned text
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/82">
                    {log.normalizedContent}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Sparkles className="text-primary h-5 w-5" />
                  What happened
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white">
                    {outcome.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    {outcome.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SectionField
                    label="Matched rule"
                    value={log.matchedRule?.keyword || "No saved reply"}
                  />
                  <SectionField
                    label="Reply source"
                    value={
                      log.replySource === "FALLBACK"
                        ? "Default reply"
                        : log.replySource === "AI_KNOWLEDGE"
                          ? "AI knowledge"
                          : log.replySource === "RULE_MATCH"
                            ? "Saved reply"
                            : "No reply"
                    }
                  />
                  <SectionField
                    label="Default reply"
                    value={
                      log.replySource === "FALLBACK" || log.fallbackUsed
                        ? "Used"
                        : log.fallbackEligible
                          ? "Available"
                          : "Not used"
                    }
                  />
                  <SectionField
                    label="Status"
                    value={
                      log.direction === "OUTBOUND"
                        ? (log.sendStatus?.toLowerCase() ?? "prepared")
                        : (log.processingStatus
                            ?.replace("_", " ")
                            .toLowerCase() ?? "received")
                    }
                  />
                </div>

                {log.processingReason || log.failureReason ? (
                  <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                    <p className="text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                      Notes
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/80">
                      {log.processingReason || log.failureReason}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Radar className="text-primary h-5 w-5" />
                  Status details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-sm leading-6 text-white/78">{status}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-4">
                    <div className="flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                      <Clock3 className="h-3.5 w-3.5" />
                      Time
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/82">
                      Logged at {formatDateTime(log.timestamp)}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-4">
                    <div className="flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                      {log.direction === "INBOUND" ? (
                        <Bot className="h-3.5 w-3.5" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Current status
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/82">
                      {log.direction === "OUTBOUND"
                        ? (log.sendStatus?.toLowerCase() ?? "prepared")
                        : (log.processingStatus
                            ?.replace("_", " ")
                            .toLowerCase() ?? "received")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              {log.relatedMessage ? (
                <ArrowRight className="text-primary h-5 w-5" />
              ) : (
                <CircleAlert className="text-primary h-5 w-5" />
              )}
              Related message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {log.relatedMessage ? (
              <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
                <div className="space-y-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
                  <Badge className="border-white/[0.08] bg-black/20 text-white/74">
                    {log.relatedMessage.direction.toLowerCase()}
                  </Badge>
                  <SectionField
                    label="Related status"
                    value={
                      log.relatedMessage.status || "No related status recorded"
                    }
                  />
                  <SectionField
                    label="Reply source"
                    value={
                      log.relatedMessage.replySource === "FALLBACK"
                        ? "Default reply"
                        : log.relatedMessage.replySource === "AI_KNOWLEDGE"
                          ? "AI knowledge"
                          : log.relatedMessage.replySource === "RULE_MATCH"
                            ? "Saved reply"
                            : "No reply"
                    }
                  />
                  <SectionField
                    label="Logged at"
                    value={formatDateTime(log.relatedMessage.timestamp)}
                  />
                </div>

                <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-5">
                  <div className="mb-4 flex items-center gap-2 text-[0.68rem] tracking-[0.18em] text-white/42 uppercase">
                    <Link2 className="h-3.5 w-3.5" />
                    Related text
                  </div>
                  <p className="text-sm leading-7 text-white/84">
                    {log.relatedMessage.content || "No related content stored."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
                <CircleAlert className="mt-0.5 h-5 w-5 text-white/62" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">
                    No related message yet
                  </p>
                  <p className="text-sm leading-6 text-white/72">
                    There is no related message saved yet.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
