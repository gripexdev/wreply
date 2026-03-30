import { prisma } from "@/database/client";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return date;
}

export async function getDashboardFoundationData(workspaceId: string) {
  const todayStart = startOfToday();
  const [
    rulesCount,
    activeRulesCount,
    connectionsCount,
    incomingCount,
    outgoingCount,
    messagesProcessedToday,
    latestIncoming,
    latestOutgoing,
    connection,
    subscription,
  ] = await Promise.all([
    prisma.autoReplyRule.count({ where: { workspaceId } }),
    prisma.autoReplyRule.count({ where: { workspaceId, isActive: true } }),
    prisma.whatsAppConnection.count({ where: { workspaceId } }),
    prisma.incomingMessageLog.count({ where: { workspaceId } }),
    prisma.outgoingMessageLog.count({ where: { workspaceId } }),
    prisma.incomingMessageLog.count({
      where: {
        workspaceId,
        receivedAt: {
          gte: todayStart,
        },
      },
    }),
    prisma.incomingMessageLog.findFirst({
      where: { workspaceId },
      orderBy: { receivedAt: "desc" },
      select: {
        receivedAt: true,
      },
    }),
    prisma.outgoingMessageLog.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        sentAt: true,
      },
    }),
    prisma.whatsAppConnection.findFirst({
      where: { workspaceId },
      select: {
        status: true,
        webhookSubscribed: true,
        sendRepliesEnabled: true,
        lastWebhookAt: true,
      },
    }),
    prisma.subscription.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        plan: {
          select: {
            name: true,
            monthlyPriceMad: true,
          },
        },
      },
    }),
  ]);

  const activityCandidates = [
    latestIncoming?.receivedAt ?? null,
    latestOutgoing?.sentAt ?? latestOutgoing?.createdAt ?? null,
    connection?.lastWebhookAt ?? null,
  ].filter((value): value is Date => Boolean(value));
  const lastActivityAt =
    activityCandidates.length > 0
      ? new Date(
          Math.max(...activityCandidates.map((value) => value.getTime())),
        )
      : null;

  return {
    rulesCount,
    activeRulesCount,
    connectionsCount,
    incomingCount,
    outgoingCount,
    messageLogCount: incomingCount + outgoingCount,
    messagesProcessedToday,
    lastActivityAt,
    connection,
    subscription,
  };
}
