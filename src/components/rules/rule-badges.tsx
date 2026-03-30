import { Badge } from "@/components/ui/badge";
import { getRuleLanguageLabel, getRuleMatchTypeLabel } from "@/config/rules";
import type { RuleLanguage, RuleMatchType } from "@/types/rules";

export function RuleLanguageBadge({
  language,
}: Readonly<{
  language: RuleLanguage;
}>) {
  return (
    <Badge className="border-sky-300/15 bg-sky-300/10 text-sky-100">
      {getRuleLanguageLabel(language)}
    </Badge>
  );
}

export function RuleMatchTypeBadge({
  matchType,
}: Readonly<{
  matchType: RuleMatchType;
}>) {
  return (
    <Badge className="border-violet-300/15 bg-violet-300/10 text-violet-100">
      {getRuleMatchTypeLabel(matchType)}
    </Badge>
  );
}

export function RuleStatusBadge({
  isActive,
}: Readonly<{
  isActive: boolean;
}>) {
  return (
    <Badge
      className={
        isActive
          ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
          : "border-white/[0.08] bg-white/[0.045] text-white/66"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
