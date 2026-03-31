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
    label: "Received",
  },
  OUTBOUND: {
    className: "border-[#A855F7]/18 bg-[#A855F7]/10 text-[#F3E8FF]",
    icon: ArrowUpRight,
    label: "Reply",
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
      description: "A saved reply handled this message.",
    };
  }

  if (log.replySource === "AI_KNOWLEDGE") {
    return {
      title: "AI knowledge reply",
      description: "The assistant answered using your saved business details.",
    };
  }

  if (log.replySource === "FALLBACK" || log.fallbackUsed) {
    return {
      title: "Default reply",
      description: "Your default reply was used.",
    };
  }

  if (log.direction === "OUTBOUND" && log.sendStatus === "FAILED") {
    return {
      title: "Reply failed",
      description: log.failureReason ?? "WhatsApp could not send this reply.",
    };
  }

  if (log.direction === "OUTBOUND") {
    return {
      title: "Reply ready",
      description:
        log.sendStatus === "PREPARED"
          ? "This reply was saved without sending."
          : "This reply was saved in your history.",
    };
  }

  return {
    title: "No saved reply",
    description: log.fallbackEligible
      ? "A default reply could be used here."
      : "This message did not match any active rule.",
  };
}

export function getMessageLogStatusSummary(log: MessageLogListItem) {
  if (log.direction === "INBOUND") {
    if (!log.processingStatus) {
      return "Received and saved.";
    }

    switch (log.processingStatus) {
      case "MATCHED":
        return "Matched one of your saved replies.";
      case "NO_MATCH":
        return log.replySource === "AI_KNOWLEDGE"
          ? "No rule matched. The assistant replied using your business details."
          : log.fallbackUsed
            ? "No rule matched. Your default reply was used."
            : "No rule matched this customer message.";
      case "FAILED":
        return "Something went wrong before the reply was prepared.";
      case "UNSUPPORTED":
        return "This message type is not supported yet.";
      case "DUPLICATE":
        return "This message was already received.";
      default:
        return "Message saved successfully.";
    }
  }

  if (!log.sendStatus) {
    return "Reply saved in your history.";
  }

  switch (log.sendStatus) {
    case "PREPARED":
      return "Saved without sending.";
    case "SENT":
      return "Sent to WhatsApp.";
    case "DELIVERED":
      return "Delivered to the customer.";
    case "FAILED":
      return log.failureReason ?? "WhatsApp could not send this reply.";
    default:
      return "Reply saved successfully.";
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

      {log.replySource === "AI_KNOWLEDGE" ? (
        <LogBadge
          icon={Bot}
          label="AI reply"
          className="border-[#22D3EE]/18 bg-[#22D3EE]/10 text-[#CFFAFE]"
        />
      ) : null}

      {log.replySource === "FALLBACK" || log.fallbackUsed ? (
        <LogBadge
          icon={Bot}
          label="Default reply"
          className="border-amber-400/18 bg-amber-500/10 text-amber-100"
        />
      ) : null}

      {log.replySource === "RULE_MATCH" || log.matchedRule ? (
        <LogBadge
          icon={Sparkles}
          label="Saved reply"
          className="border-[#A855F7]/18 bg-[#A855F7]/10 text-[#F3E8FF]"
        />
      ) : null}
    </div>
  );
}
