import { Prisma } from "@prisma/client";

import { prisma } from "@/database/client";
import {
  messageLogsQuerySchema,
  type MessageLogsQueryInput,
} from "@/lib/validation/message-logs";
import { truncateText } from "@/lib/utils";
import type {
  MessageLogListItem,
  MessageLogsListResponse,
  MessageLogsQueryState,
} from "@/types/message-logs";

type IncomingMessageLogRecord = Prisma.IncomingMessageLogGetPayload<{
  include: {
    matchedRule: {
      select: {
        id: true;
        keyword: true;
      };
    };
    outgoingReplies: {
      orderBy: [{ createdAt: "desc" }];
      take: 1;
      select: {
        id: true;
        content: true;
        status: true;
        replySource: true;
        failureReason: true;
        externalMessageId: true;
        sentAt: true;
        createdAt: true;
        matchedRule: {
          select: {
            keyword: true;
          };
        };
      };
    };
  };
}>;

type OutgoingMessageLogRecord = Prisma.OutgoingMessageLogGetPayload<{
  include: {
    matchedRule: {
      select: {
        id: true;
        keyword: true;
      };
    };
    relatedIncomingMessage: {
      select: {
        id: true;
        contactName: true;
        content: true;
        receivedAt: true;
        processingStatus: true;
        fallbackEligible: true;
        fallbackUsed: true;
        matchedRule: {
          select: {
            keyword: true;
          };
        };
      };
    };
  };
}>;

function getDateFloor(dateRange: MessageLogsQueryState["dateRange"]) {
  if (dateRange === "all") {
    return null;
  }

  const now = Date.now();
  const durations = {
    "24h": 1000 * 60 * 60 * 24,
    "7d": 1000 * 60 * 60 * 24 * 7,
    "30d": 1000 * 60 * 60 * 24 * 30,
  } as const;

  return new Date(now - durations[dateRange]);
}

function shouldFetchInboundLogs(filters: MessageLogsQueryState) {
  return filters.direction !== "outbound" && filters.sendStatus === "all";
}

function shouldFetchOutboundLogs(filters: MessageLogsQueryState) {
  return filters.direction !== "inbound";
}

function buildIncomingWhere(
  workspaceId: string,
  filters: MessageLogsQueryState,
): Prisma.IncomingMessageLogWhereInput {
  const dateFloor = getDateFloor(filters.dateRange);

  return {
    workspaceId,
    ...(dateFloor
      ? {
          receivedAt: {
            gte: dateFloor,
          },
        }
      : {}),
    ...(filters.outcome === "matched"
      ? {
          matchedRuleId: {
            not: null,
          },
        }
      : {}),
    ...(filters.outcome === "unmatched"
      ? {
          matchedRuleId: null,
        }
      : {}),
    ...(filters.fallback === "used"
      ? {
          fallbackUsed: true,
        }
      : {}),
    ...(filters.fallback === "not_used"
      ? {
          fallbackUsed: false,
        }
      : {}),
    ...(filters.search
      ? {
          OR: [
            {
              content: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              senderPhone: {
                contains: filters.search,
              },
            },
            {
              recipientPhone: {
                contains: filters.search,
              },
            },
            {
              contactName: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };
}

function buildOutgoingWhere(
  workspaceId: string,
  filters: MessageLogsQueryState,
): Prisma.OutgoingMessageLogWhereInput {
  const dateFloor = getDateFloor(filters.dateRange);

  return {
    workspaceId,
    ...(dateFloor
      ? {
          createdAt: {
            gte: dateFloor,
          },
        }
      : {}),
    ...(filters.sendStatus !== "all"
      ? {
          status: filters.sendStatus,
        }
      : {}),
    ...(filters.outcome === "matched"
      ? {
          replySource: "RULE_MATCH",
        }
      : {}),
    ...(filters.outcome === "unmatched"
      ? {
          replySource: "FALLBACK",
        }
      : {}),
    ...(filters.fallback === "used"
      ? {
          replySource: "FALLBACK",
        }
      : {}),
    ...(filters.fallback === "not_used"
      ? {
          OR: [
            {
              replySource: "RULE_MATCH",
            },
            {
              replySource: null,
            },
          ],
        }
      : {}),
    ...(filters.search
      ? {
          OR: [
            {
              content: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              recipientPhone: {
                contains: filters.search,
              },
            },
            {
              relatedIncomingMessage: {
                is: {
                  senderPhone: {
                    contains: filters.search,
                  },
                },
              },
            },
            {
              relatedIncomingMessage: {
                is: {
                  contactName: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
}

function toTimestamp(value: Date) {
  return value.toISOString();
}

function toContentPreview(content: string | null | undefined) {
  return truncateText(content, 96) || "No message content";
}

function toInboundItem(
  log: IncomingMessageLogRecord,
): MessageLogListItem {
  const relatedOutbound = log.outgoingReplies[0] ?? null;

  return {
    id: log.id,
    direction: "INBOUND",
    timestamp: toTimestamp(log.processedAt ?? log.receivedAt),
    contactName: log.contactName,
    contactPhone: log.senderPhone,
    content: log.content,
    contentPreview: toContentPreview(log.content),
    matched: Boolean(log.matchedRuleId),
    matchedRule: log.matchedRule
      ? {
          id: log.matchedRule.id,
          keyword: log.matchedRule.keyword,
        }
      : null,
    processingStatus: log.processingStatus,
    processingReason: log.processingReason,
    normalizedContent: log.normalizedContent,
    fallbackEligible: log.fallbackEligible,
    fallbackUsed: log.fallbackUsed,
    sendStatus: relatedOutbound?.status ?? null,
    replySource: relatedOutbound?.replySource ?? null,
    failureReason: relatedOutbound?.failureReason ?? null,
    providerMessageId: relatedOutbound?.externalMessageId ?? null,
    relatedMessage: relatedOutbound
      ? {
          id: relatedOutbound.id,
          direction: "OUTBOUND",
          content: relatedOutbound.content,
          contentPreview: toContentPreview(relatedOutbound.content),
          timestamp: toTimestamp(
            relatedOutbound.sentAt ?? relatedOutbound.createdAt,
          ),
          status: relatedOutbound.status,
          matchedRuleKeyword: relatedOutbound.matchedRule?.keyword ?? null,
          fallbackUsed: relatedOutbound.replySource === "FALLBACK",
          replySource: relatedOutbound.replySource,
        }
      : null,
  };
}

function toOutboundItem(
  log: OutgoingMessageLogRecord,
): MessageLogListItem {
  return {
    id: log.id,
    direction: "OUTBOUND",
    timestamp: toTimestamp(log.sentAt ?? log.createdAt),
    contactName: log.relatedIncomingMessage?.contactName ?? null,
    contactPhone: log.recipientPhone,
    content: log.content,
    contentPreview: toContentPreview(log.content),
    matched:
      log.replySource === "RULE_MATCH"
        ? true
        : log.replySource === "FALLBACK"
          ? false
          : null,
    matchedRule: log.matchedRule
      ? {
          id: log.matchedRule.id,
          keyword: log.matchedRule.keyword,
        }
      : null,
    processingStatus: null,
    processingReason: null,
    normalizedContent: null,
    fallbackEligible:
      log.replySource === "FALLBACK"
        ? true
        : log.relatedIncomingMessage?.fallbackEligible ?? null,
    fallbackUsed: log.replySource === "FALLBACK",
    sendStatus: log.status,
    replySource: log.replySource,
    failureReason: log.failureReason,
    providerMessageId: log.externalMessageId,
    relatedMessage: log.relatedIncomingMessage
      ? {
          id: log.relatedIncomingMessage.id,
          direction: "INBOUND",
          content: log.relatedIncomingMessage.content,
          contentPreview: toContentPreview(log.relatedIncomingMessage.content),
          timestamp: toTimestamp(log.relatedIncomingMessage.receivedAt),
          status: log.relatedIncomingMessage.processingStatus,
          matchedRuleKeyword:
            log.relatedIncomingMessage.matchedRule?.keyword ?? null,
          fallbackUsed: log.relatedIncomingMessage.fallbackUsed,
          replySource: null,
        }
      : null,
  };
}

export async function listWorkspaceMessageLogs(
  workspaceId: string,
  rawQuery: MessageLogsQueryInput,
): Promise<MessageLogsListResponse> {
  const filters = messageLogsQuerySchema.parse(rawQuery);
  const incomingPromise = shouldFetchInboundLogs(filters)
    ? prisma.incomingMessageLog.findMany({
        where: buildIncomingWhere(workspaceId, filters),
        orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
        include: {
          matchedRule: {
            select: {
              id: true,
              keyword: true,
            },
          },
          outgoingReplies: {
            orderBy: [{ createdAt: "desc" }],
            take: 1,
            select: {
              id: true,
              content: true,
              status: true,
              replySource: true,
              failureReason: true,
              externalMessageId: true,
              sentAt: true,
              createdAt: true,
              matchedRule: {
                select: {
                  keyword: true,
                },
              },
            },
          },
        },
      })
    : Promise.resolve([]);
  const outgoingPromise = shouldFetchOutboundLogs(filters)
    ? prisma.outgoingMessageLog.findMany({
        where: buildOutgoingWhere(workspaceId, filters),
        orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
        include: {
          matchedRule: {
            select: {
              id: true,
              keyword: true,
            },
          },
          relatedIncomingMessage: {
            select: {
              id: true,
              contactName: true,
              content: true,
              receivedAt: true,
              processingStatus: true,
              fallbackEligible: true,
              fallbackUsed: true,
              matchedRule: {
                select: {
                  keyword: true,
                },
              },
            },
          },
        },
      })
    : Promise.resolve([]);
  const [incomingLogs, outgoingLogs] = await Promise.all([
    incomingPromise,
    outgoingPromise,
  ]);
  const combinedLogs = [
    ...incomingLogs.map(toInboundItem),
    ...outgoingLogs.map(toOutboundItem),
  ].sort(
    (leftLog, rightLog) =>
      new Date(rightLog.timestamp).getTime() -
      new Date(leftLog.timestamp).getTime(),
  );

  return {
    logs: combinedLogs,
    summary: {
      total: combinedLogs.length,
      inbound: combinedLogs.filter((log) => log.direction === "INBOUND").length,
      outbound: combinedLogs.filter((log) => log.direction === "OUTBOUND")
        .length,
      matchedInbound: combinedLogs.filter(
        (log) => log.direction === "INBOUND" && log.matched,
      ).length,
      fallbackReplies: combinedLogs.filter(
        (log) => log.direction === "OUTBOUND" && log.replySource === "FALLBACK",
      ).length,
      failedReplies: combinedLogs.filter(
        (log) => log.direction === "OUTBOUND" && log.sendStatus === "FAILED",
      ).length,
    },
    filters,
  };
}
