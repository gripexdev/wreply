import { prisma } from "@/database/client";
import { analyticsRangeLabelMap } from "@/config/analytics";
import {
  analyticsQuerySchema,
  type AnalyticsQueryInput,
} from "@/lib/validation/analytics";
import { truncateText } from "@/lib/utils";
import type {
  AnalyticsDateRange,
  AnalyticsDeliveryIssue,
  AnalyticsSeriesPoint,
  AnalyticsTopRule,
  WorkspaceAnalyticsView,
} from "@/types/analytics";

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function toDayKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatFullDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRangeStartDate(range: AnalyticsDateRange) {
  if (range === "all") {
    return null;
  }

  const today = startOfDay(new Date());
  const daysBackMap = {
    "7d": 6,
    "30d": 29,
    "90d": 89,
  } as const;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysBackMap[range]);

  return startDate;
}

function getSeriesWindow(
  range: AnalyticsDateRange,
  incomingLogs: Array<{ receivedAt: Date }>,
  outgoingLogs: Array<{ createdAt: Date; sentAt: Date | null }>,
) {
  if (range !== "all") {
    const startDate = getRangeStartDate(range);
    const endDate = startOfDay(new Date());

    return {
      startDate,
      endDate,
      windowLabel: `${formatFullDayLabel(startDate ?? endDate)} to ${formatFullDayLabel(endDate)}`,
    };
  }

  const timestamps = [
    ...incomingLogs.map((log) => log.receivedAt.getTime()),
    ...outgoingLogs.map((log) => (log.sentAt ?? log.createdAt).getTime()),
  ].filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) {
    return {
      startDate: null,
      endDate: null,
      windowLabel: "No recorded activity yet",
    };
  }

  const startDate = startOfDay(new Date(Math.min(...timestamps)));
  const endDate = startOfDay(new Date(Math.max(...timestamps)));

  return {
    startDate,
    endDate,
    windowLabel: `${formatFullDayLabel(startDate)} to ${formatFullDayLabel(endDate)}`,
  };
}

function buildSeriesSkeleton(
  startDate: Date | null,
  endDate: Date | null,
): AnalyticsSeriesPoint[] {
  if (!startDate || !endDate) {
    return [];
  }

  const points: AnalyticsSeriesPoint[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const pointDate = new Date(cursor);

    points.push({
      dateKey: toDayKey(pointDate),
      label: formatFullDayLabel(pointDate),
      shortLabel: formatDayLabel(pointDate),
      incoming: 0,
      matched: 0,
      unmatched: 0,
      fallbackUsed: 0,
      prepared: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

function buildIssuePreview(content: string | null) {
  return truncateText(content, 72) || "No reply body recorded";
}

export async function getWorkspaceAnalytics(
  workspaceId: string,
  rawQuery: AnalyticsQueryInput,
): Promise<WorkspaceAnalyticsView> {
  const query = analyticsQuerySchema.parse(rawQuery);
  const rangeStartDate = getRangeStartDate(query.range);
  const incomingWhere = rangeStartDate
    ? {
        workspaceId,
        receivedAt: {
          gte: rangeStartDate,
        },
      }
    : {
        workspaceId,
      };
  const outgoingWhere = rangeStartDate
    ? {
        workspaceId,
        OR: [
          {
            createdAt: {
              gte: rangeStartDate,
            },
          },
          {
            sentAt: {
              gte: rangeStartDate,
            },
          },
        ],
      }
    : {
        workspaceId,
      };

  const [incomingLogs, outgoingLogs, activeRules] = await Promise.all([
    prisma.incomingMessageLog.findMany({
      where: incomingWhere,
      select: {
        id: true,
        receivedAt: true,
        matchedRuleId: true,
        fallbackUsed: true,
        matchedRule: {
          select: {
            id: true,
            keyword: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        receivedAt: "asc",
      },
    }),
    prisma.outgoingMessageLog.findMany({
      where: outgoingWhere,
      select: {
        id: true,
        status: true,
        replySource: true,
        createdAt: true,
        sentAt: true,
        failureReason: true,
        recipientPhone: true,
        content: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.autoReplyRule.count({
      where: {
        workspaceId,
        isActive: true,
      },
    }),
  ]);

  const { startDate, endDate, windowLabel } = getSeriesWindow(
    query.range,
    incomingLogs,
    outgoingLogs,
  );
  const series = buildSeriesSkeleton(startDate, endDate);
  const seriesByKey = new Map(
    series.map((point) => [point.dateKey, point] as const),
  );

  for (const log of incomingLogs) {
    const point = seriesByKey.get(toDayKey(log.receivedAt));

    if (!point) {
      continue;
    }

    point.incoming += 1;

    if (log.matchedRuleId) {
      point.matched += 1;
    } else {
      point.unmatched += 1;
    }

    if (log.fallbackUsed) {
      point.fallbackUsed += 1;
    }
  }

  for (const log of outgoingLogs) {
    const activityDate = log.sentAt ?? log.createdAt;
    const point = seriesByKey.get(toDayKey(activityDate));

    if (!point) {
      continue;
    }

    if (log.status === "PREPARED" || log.status === "QUEUED") {
      point.prepared += 1;
    }

    if (log.status === "SENT") {
      point.sent += 1;
    }

    if (log.status === "DELIVERED") {
      point.delivered += 1;
    }

    if (log.status === "FAILED") {
      point.failed += 1;
    }
  }

  const totalIncomingMessages = incomingLogs.length;
  const matchedMessages = incomingLogs.filter((log) =>
    Boolean(log.matchedRuleId),
  ).length;
  const unmatchedMessages = totalIncomingMessages - matchedMessages;
  const fallbackRepliesUsed = incomingLogs.filter(
    (log) => log.fallbackUsed,
  ).length;
  const outboundPrepared = outgoingLogs.filter(
    (log) => log.status === "PREPARED" || log.status === "QUEUED",
  ).length;
  const outboundSent = outgoingLogs.filter(
    (log) => log.status === "SENT",
  ).length;
  const outboundDelivered = outgoingLogs.filter(
    (log) => log.status === "DELIVERED",
  ).length;
  const outboundFailed = outgoingLogs.filter(
    (log) => log.status === "FAILED",
  ).length;
  const topRulesMap = new Map<
    string,
    { id: string; keyword: string; isActive: boolean; matchCount: number }
  >();

  for (const log of incomingLogs) {
    if (!log.matchedRule) {
      continue;
    }

    const currentRule = topRulesMap.get(log.matchedRule.id);

    if (currentRule) {
      currentRule.matchCount += 1;
      continue;
    }

    topRulesMap.set(log.matchedRule.id, {
      id: log.matchedRule.id,
      keyword: log.matchedRule.keyword,
      isActive: log.matchedRule.isActive,
      matchCount: 1,
    });
  }

  const topRules: AnalyticsTopRule[] = [...topRulesMap.values()]
    .sort((leftRule, rightRule) => {
      if (rightRule.matchCount !== leftRule.matchCount) {
        return rightRule.matchCount - leftRule.matchCount;
      }

      return leftRule.keyword.localeCompare(rightRule.keyword);
    })
    .slice(0, 6)
    .map((rule) => ({
      ...rule,
      matchShare: matchedMessages
        ? Number(((rule.matchCount / matchedMessages) * 100).toFixed(1))
        : 0,
    }));

  const recentDeliveryIssues: AnalyticsDeliveryIssue[] = outgoingLogs
    .filter((log) => log.status === "FAILED" && Boolean(log.failureReason))
    .sort(
      (leftLog, rightLog) =>
        rightLog.createdAt.getTime() - leftLog.createdAt.getTime(),
    )
    .slice(0, 5)
    .map((log) => ({
      id: log.id,
      recipientPhone: log.recipientPhone,
      createdAt: log.createdAt.toISOString(),
      failureReason: log.failureReason ?? "Unknown failure",
      contentPreview: buildIssuePreview(log.content),
      replySource: log.replySource,
    }));

  return {
    range: query.range,
    rangeLabel: analyticsRangeLabelMap[query.range],
    windowLabel,
    hasData: totalIncomingMessages > 0 || outgoingLogs.length > 0,
    kpis: {
      totalIncomingMessages,
      matchedMessages,
      unmatchedMessages,
      matchRate: totalIncomingMessages
        ? Number(((matchedMessages / totalIncomingMessages) * 100).toFixed(1))
        : 0,
      fallbackRepliesUsed,
      fallbackUsageRate: totalIncomingMessages
        ? Number(
            ((fallbackRepliesUsed / totalIncomingMessages) * 100).toFixed(1),
          )
        : 0,
      outboundPrepared,
      outboundSent,
      outboundDelivered,
      outboundFailed,
      activeRules,
    },
    series,
    topRules,
    recentDeliveryIssues,
  };
}
