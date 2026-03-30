import type { ComponentType } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  CheckCheck,
  CircleAlert,
  CircleDashed,
  SearchSlash,
  Send,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageLogListItem } from "@/types/message-logs";

const directionBadgeStyles = {
  INBOUND: {
    className: "border-[#3B82F6]/18 bg-[#3B82F6]/10 text-[#DBEAFE]",
    icon: ArrowDownLeft,
    label: "Inbound",
  },
  OUTBOUND: {
    className: "border-[#A855F7]/18 bg-[#A855F7]/10 text-[#F3E8FF]",
    icon: ArrowUpRight,
    label: "Outbound",
  },
} as const;

const processingBadgeMap = {
  MATCHED: {
    className: "border-emerald-400/18 bg-emerald-500/10 text-emerald-100",
    icon: Sparkles,
    label: "Matched",
  },
  NO_MATCH: {
    className: "border-amber-400/18 bg-amber-500/10 text-amber-100",
    icon: SearchSlash,
    label: "No match",
  },
  RECEIVED: {
    className: "border-white/10 bg-white/[0.04] text-white/82",
    icon: CircleDashed,
    label: "Received",
  },
  UNSUPPORTED: {
    className: "border-white/10 bg-white/[0.04] text-white/82",
    icon: CircleAlert,
    label: "Unsupported",
  },
  DUPLICATE: {
    className: "border-white/10 bg-white/[0.04] text-white/82",
    icon: CircleDashed,
    label: "Duplicate",
  },
  FAILED: {
    className: "border-rose-400/18 bg-rose-500/10 text-rose-100",
    icon: TriangleAlert,
    label: "Failed",
  },
} as const;

const sendBadgeMap = {
  PREPARED: {
    className: "border-amber-400/18 bg-amber-500/10 text-amber-100",
    icon: Send,
    label: "Prepared",
  },
  SENT: {
    className: "border-emerald-400/18 bg-emerald-500/10 text-emerald-100",
    icon: CheckCheck,
    label: "Sent",
  },
  DELIVERED: {
    className: "border-emerald-400/18 bg-emerald-500/10 text-emerald-100",
    icon: CheckCheck,
    label: "Delivered",
  },
  FAILED: {
    className: "border-rose-400/18 bg-rose-500/10 text-rose-100",
    icon: TriangleAlert,
    label: "Failed",
  },
} as const;

function LogBadge({
  icon: Icon,
  label,
  className,
}: Readonly<{
  icon: ComponentType<{ className?: string }>;
  label: string;
  className: string;
}>) {
  return (
    <Badge className={cn("gap-1.5 pr-3", className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}

export function getMessageLogOutcomeSummary(log: MessageLogListItem) {
  if (log.matchedRule) {
    return {
      title: `Matched "${log.matchedRule.keyword}"`,
      description: "A saved auto-reply rule handled this message.",
    };
  }

  if (log.replySource === "FALLBACK" || log.fallbackUsed) {
    return {
      title: "Fallback reply",
      description:
        "No rule matched, so the workspace fallback message took over.",
    };
  }

  if (log.direction === "OUTBOUND" && log.sendStatus === "FAILED") {
    return {
      title: "Delivery failed",
      description:
        log.failureReason ??
        "The send attempt reached the provider but did not complete.",
    };
  }

  if (log.direction === "OUTBOUND") {
    return {
      title: "Outbound reply",
      description:
        log.sendStatus === "PREPARED"
          ? "The reply was prepared and stored without a send attempt."
          : "The reply was recorded as outbound activity.",
    };
  }

  return {
    title: "No rule match",
    description: log.fallbackEligible
      ? "This inbound message was eligible for fallback handling."
      : "This inbound message did not match any active rule.",
  };
}

export function getMessageLogStatusSummary(log: MessageLogListItem) {
  if (log.direction === "INBOUND") {
    if (!log.processingStatus) {
      return "Received and stored for inspection.";
    }

    switch (log.processingStatus) {
      case "MATCHED":
        return "Resolved by the matching engine.";
      case "NO_MATCH":
        return log.fallbackUsed
          ? "No rule matched. Fallback behavior covered the reply."
          : "No rule matched this customer message.";
      case "FAILED":
        return "Processing failed before the automation flow completed.";
      case "UNSUPPORTED":
        return "The event was ingested but not handled in this flow.";
      case "DUPLICATE":
        return "A duplicate event was detected and safely ignored.";
      default:
        return "Inbound activity was recorded successfully.";
    }
  }

  if (!log.sendStatus) {
    return "Outbound activity is available for review.";
  }

  switch (log.sendStatus) {
    case "PREPARED":
      return "Prepared for reply review without a provider send attempt.";
    case "SENT":
      return "Accepted by the provider as a real send attempt.";
    case "DELIVERED":
      return "Confirmed as delivered by the provider.";
    case "FAILED":
      return log.failureReason ?? "The provider send attempt failed.";
    default:
      return "Outbound activity was logged successfully.";
  }
}

export function MessageLogBadges({
  log,
  compact = false,
}: Readonly<{
  log: MessageLogListItem;
  compact?: boolean;
}>) {
  const directionConfig = directionBadgeStyles[log.direction];
  const processingConfig =
    log.direction === "INBOUND" && log.processingStatus
      ? processingBadgeMap[
          log.processingStatus as keyof typeof processingBadgeMap
        ]
      : null;
  const sendConfig =
    log.direction === "OUTBOUND" && log.sendStatus
      ? sendBadgeMap[log.sendStatus as keyof typeof sendBadgeMap]
      : null;

  return (
    <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
      <LogBadge
        icon={directionConfig.icon}
        label={directionConfig.label}
        className={directionConfig.className}
      />

      {processingConfig ? (
        <LogBadge
          icon={processingConfig.icon}
          label={processingConfig.label}
          className={processingConfig.className}
        />
      ) : null}

      {sendConfig ? (
        <LogBadge
          icon={sendConfig.icon}
          label={sendConfig.label}
          className={sendConfig.className}
        />
      ) : null}

      {log.replySource === "FALLBACK" || log.fallbackUsed ? (
        <LogBadge
          icon={Bot}
          label="Fallback"
          className="border-amber-400/18 bg-amber-500/10 text-amber-100"
        />
      ) : null}

      {log.replySource === "RULE_MATCH" || log.matchedRule ? (
        <LogBadge
          icon={Sparkles}
          label="Rule reply"
          className="border-[#A855F7]/18 bg-[#A855F7]/10 text-[#F3E8FF]"
        />
      ) : null}
    </div>
  );
}
