"use client";

import { ArrowRight, CircleAlert, Send, Sparkles } from "lucide-react";

import { MessageLogBadges } from "@/components/messages/message-log-badges";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

function DetailField({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="text-sm leading-6 text-white/90">{value}</p>
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
  return (
    <Dialog open={Boolean(log)} onClose={onClose} panelClassName="max-w-4xl">
      {log ? (
        <DialogContent className="space-y-6">
          <DialogHeader
            title={
              log.direction === "INBOUND"
                ? "Inbound message details"
                : "Outbound reply details"
            }
            description="Inspect what happened, why it happened, and how this message is linked to the surrounding automation flow."
            onClose={onClose}
          />

          <div className="flex flex-wrap items-center gap-3">
            <MessageLogBadges log={log} />
            <span className="text-muted-foreground text-sm">
              {formatDateTime(log.timestamp)}
            </span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Message content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailField
                  label="Contact"
                  value={
                    log.contactName
                      ? `${log.contactName} (${log.contactPhone})`
                      : log.contactPhone
                  }
                />
                <DetailField
                  label="Content"
                  value={log.content || "No message content was stored."}
                />
                {log.normalizedContent ? (
                  <DetailField
                    label="Normalized content"
                    value={log.normalizedContent}
                  />
                ) : null}
                {log.providerMessageId ? (
                  <DetailField
                    label="Provider message ID"
                    value={log.providerMessageId}
                  />
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Operational context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailField
                  label="Matched rule"
                  value={log.matchedRule?.keyword || "No matched rule"}
                />
                <DetailField
                  label="Fallback"
                  value={
                    log.replySource === "FALLBACK" || log.fallbackUsed
                      ? "Fallback reply was used."
                      : log.fallbackEligible
                        ? "Fallback was eligible but not used."
                        : "Fallback was not involved."
                  }
                />
                {log.processingReason ? (
                  <DetailField
                    label="Processing reason"
                    value={log.processingReason}
                  />
                ) : null}
                {log.failureReason ? (
                  <DetailField
                    label="Failure reason"
                    value={log.failureReason}
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Sparkles className="text-primary h-5 w-5" />
                  Processing summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailField
                  label="Direction"
                  value={log.direction.toLowerCase()}
                />
                <DetailField
                  label="Matched"
                  value={
                    log.matched === null
                      ? "Not applicable"
                      : log.matched
                        ? "Matched"
                        : "Unmatched"
                  }
                />
                <DetailField
                  label="Send status"
                  value={log.sendStatus?.toLowerCase() || "Not applicable"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  {log.direction === "INBOUND" ? (
                    <ArrowRight className="text-primary h-5 w-5" />
                  ) : (
                    <Send className="text-primary h-5 w-5" />
                  )}
                  Related activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {log.relatedMessage ? (
                  <>
                    <DetailField
                      label="Related direction"
                      value={log.relatedMessage.direction.toLowerCase()}
                    />
                    <DetailField
                      label="Related content"
                      value={
                        log.relatedMessage.content || "No related content stored."
                      }
                    />
                    <DetailField
                      label="Related status"
                      value={log.relatedMessage.status || "No status recorded"}
                    />
                  </>
                ) : (
                  <div className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    <CircleAlert className="mt-0.5 h-5 w-5 text-white/70" />
                    <p className="text-sm leading-6 text-white/80">
                      No directly related inbound or outbound partner message is
                      stored for this log item yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
