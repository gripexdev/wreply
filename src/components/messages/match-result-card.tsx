import {
  CheckCircle2,
  CircleDashed,
  MessageSquareText,
  ScanSearch,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { messageLanguageHintLabels } from "@/config/messages";
import { getRuleLanguageLabel, getRuleMatchTypeLabel } from "@/config/rules";
import type { MessageMatchResult } from "@/types/messages";

function DetailRow({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-white">{value}</p>
    </div>
  );
}

export function MatchResultCard({
  result,
}: Readonly<{
  result: MessageMatchResult | null;
}>) {
  if (!result) {
    return (
      <Card className="surface-glow h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <ScanSearch className="text-primary h-5 w-5" />
            Reply result
          </CardTitle>
          <CardDescription>
            Try a message to see which reply would be used.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[24rem] items-center justify-center px-6 pb-6">
          <div className="max-w-md text-center">
            <span className="text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/5">
              <CircleDashed className="h-8 w-8" />
            </span>
            <h3 className="font-display mt-6 text-2xl font-semibold text-white">
              Ready to test a message
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-7">
              Enter a customer message to preview the result.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-glow h-full">
      <CardHeader className="border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-white">
              {result.matched ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              ) : (
                <CircleDashed className="h-5 w-5 text-amber-200" />
              )}
              {result.matched ? "Reply found" : "No reply found"}
            </CardTitle>
            <CardDescription className="mt-2">{result.reason}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                result.matched
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                  : "border-amber-400/20 bg-amber-500/10 text-amber-100"
              }
            >
              {result.matched ? "Matched" : "No match"}
            </Badge>
            <Badge className="border-white/10 bg-white/[0.03] text-white">
              {messageLanguageHintLabels[result.messageLanguageHint]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <DetailRow
            label="Cleaned message"
            value={result.normalizedMessage || "(empty after normalization)"}
          />
          <DetailRow
            label="Active rules checked"
            value={`${result.eligibleRulesCount} active / ${result.evaluatedRulesCount} fetched`}
          />
        </div>

        {result.matched && result.matchedRule ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DetailRow
                label="Matched rule"
                value={result.matchedRule.keyword}
              />
              <DetailRow
                label="How it matched"
                value={`${result.matchTypeUsed ? getRuleMatchTypeLabel(result.matchTypeUsed) : "n/a"} via ${result.matchSource ?? "n/a"}`}
              />
              <DetailRow
                label="Matched text"
                value={result.matchedTextFragment ?? "n/a"}
              />
              <DetailRow
                label="Matched word"
                value={result.matchedAlias ?? result.matchedKeyword ?? "n/a"}
              />
              <DetailRow
                label="Word group"
                value={result.matchedAliasFamily ?? "Direct keyword"}
              />
              <DetailRow
                label="Match score"
                value={result.score !== null ? `${result.score}/100` : "n/a"}
              />
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                    Reply preview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/90">
                    This is the saved reply that would be used.
                  </p>
                </div>
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Priority #{result.matchedRule.priority}
                </Badge>
              </div>
              <div className="mt-4 rounded-[20px] border border-white/10 bg-[#08111d] px-4 py-4">
                <p className="text-sm leading-7 text-white">
                  {result.matchedRule.replyMessage}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="border-white/10 bg-white/[0.03] text-white">
                  {getRuleLanguageLabel(result.matchedRule.language)}
                </Badge>
                <Badge className="border-white/10 bg-white/[0.03] text-white">
                  {result.matchedRule.category ?? "Uncategorized"}
                </Badge>
                <Badge className="border-white/10 bg-white/[0.03] text-white">
                  Default reply not needed
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.02] p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-amber-100">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  No saved reply matched this message
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  A default reply could be used if it is turned on.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="border-white/10 bg-white/[0.03] text-white">
                    Default reply available
                  </Badge>
                  <Badge className="border-white/10 bg-white/[0.03] text-white">
                    Nothing sent
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
