import { ChevronRight } from "lucide-react";

import { MessageLogBadges } from "@/components/messages/message-log-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

export function MessageLogCards({
  logs,
  onView,
}: Readonly<{
  logs: MessageLogListItem[];
  onView: (log: MessageLogListItem) => void;
}>) {
  return (
    <div className="grid gap-4 lg:hidden">
      {logs.map((log) => (
        <Card key={`${log.direction}-${log.id}`}>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <MessageLogBadges log={log} />
                <p className="text-sm font-semibold text-white">
                  {log.contactName || log.contactPhone}
                </p>
                {log.contactName ? (
                  <p className="text-muted-foreground text-sm">
                    {log.contactPhone}
                  </p>
                ) : null}
              </div>
              <Button variant="secondary" size="icon" onClick={() => onView(log)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm leading-7 text-white/90">{log.contentPreview}</p>

            <div className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs uppercase">Outcome</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {log.matchedRule
                    ? `Rule: ${log.matchedRule.keyword}`
                    : log.replySource === "FALLBACK" || log.fallbackUsed
                      ? "Fallback reply"
                      : "No rule match"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">Time</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {formatDateTime(log.timestamp)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
