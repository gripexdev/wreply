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
          Top replies
        </CardTitle>
        <CardDescription>Most used.</CardDescription>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/[0.08] bg-white/[0.03] px-5 py-8 text-center text-sm text-white/54">
            No matches yet
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="grid gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 md:grid-cols-[1.3fr_0.5fr_0.6fr_0.6fr] md:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {rule.keyword}
                  </p>
                  <p className="mt-1 text-xs text-white/42">
                    {matchedMessages > 0
                      ? `${rule.matchCount}/${matchedMessages}`
                      : "0"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {rule.matchCount}
                </p>
                <p className="text-sm font-semibold text-white">
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
                    {rule.isActive ? "on" : "off"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
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
          Send issues
        </CardTitle>
        <CardDescription>Recent problems.</CardDescription>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/[0.08] bg-white/[0.03] px-5 py-8 text-center text-sm text-white/54">
            No send issues
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {issue.recipientPhone}
                    </p>
                    <p className="text-xs text-white/42">
                      {formatDateTime(issue.createdAt)}
                    </p>
                  </div>
                  {issue.replySource ? (
                    <Badge className="border-white/[0.08] bg-white/[0.03] text-white/72">
                      {issue.replySource === "FALLBACK"
                        ? "default"
                        : issue.replySource === "AI_KNOWLEDGE"
                          ? "ai"
                          : "rule"}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-4 text-sm text-white/80">
                  {issue.contentPreview}
                </p>
                <p className="mt-2 text-sm text-rose-100/84">
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
