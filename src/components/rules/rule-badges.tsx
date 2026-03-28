import { Badge } from "@/components/ui/badge";
import { getRuleLanguageLabel, getRuleMatchTypeLabel } from "@/config/rules";
import type { RuleLanguage, RuleMatchType } from "@/types/rules";

export function RuleLanguageBadge({
  language,
}: Readonly<{
  language: RuleLanguage;
}>) {
  return (
    <Badge className="border-sky-400/20 bg-sky-500/10 text-sky-100">
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
    <Badge className="border-violet-400/20 bg-violet-500/10 text-violet-100">
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
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
          : "text-muted-foreground border-white/10 bg-white/5"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
