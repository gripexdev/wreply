import { AlertTriangle, Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type {
  AnalyticsDeliveryIssue,
  AnalyticsTopRule,
} from "@/types/analytics";

export function TopRulesInsight({
  rules,
  matchedMessages,
}: Readonly<{
  rules: AnalyticsTopRule[];
  matchedMessages: number;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <Award className="text-primary h-5 w-5" />
          Top matched rules
        </CardTitle>
        <CardDescription>
          Ranked by how often each rule matched within the selected date range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm leading-7 text-white/70">
            No rule matches were recorded in this range yet.
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.3fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-white/10 px-2 pb-3 text-xs tracking-[0.18em] text-white/45 uppercase md:grid">
              <span>Keyword</span>
              <span>Matches</span>
              <span>Share</span>
              <span>Status</span>
            </div>
            <div className="space-y-3 pt-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 md:grid-cols-[1.3fr_0.7fr_0.8fr_0.7fr] md:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {rule.keyword}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {matchedMessages > 0
                        ? `${rule.matchCount} of ${matchedMessages} matched inbound messages`
                        : "No matched messages yet"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white md:text-base">
                    {rule.matchCount}
                  </p>
                  <p className="text-sm font-semibold text-white md:text-base">
                    {rule.matchShare}%
                  </p>
                  <div>
                    <Badge
                      className={
                        rule.isActive
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                          : "border-amber-400/20 bg-amber-500/10 text-amber-100"
                      }
                    >
                      {rule.isActive ? "active" : "inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function DeliveryIssuesInsight({
  issues,
}: Readonly<{
  issues: AnalyticsDeliveryIssue[];
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <AlertTriangle className="text-primary h-5 w-5" />
          Recent delivery issues
        </CardTitle>
        <CardDescription>
          The latest failed outbound attempts recorded during the selected
          range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm leading-7 text-white/70">
            No outbound failures were recorded in this range.
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {issue.recipientPhone}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDateTime(issue.createdAt)}
                    </p>
                  </div>
                  {issue.replySource ? (
                    <Badge className="border-white/10 bg-white/[0.03] text-white">
                      {issue.replySource === "FALLBACK"
                        ? "fallback"
                        : "rule reply"}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-white/85">
                  {issue.contentPreview}
                </p>
                <p className="mt-3 text-sm leading-7 text-rose-100/85">
                  {issue.failureReason}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
