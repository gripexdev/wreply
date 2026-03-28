import { prisma } from "@/database/client";

export async function getDashboardFoundationData(workspaceId: string) {
  const [
    rulesCount,
    connectionsCount,
    incomingCount,
    outgoingCount,
    subscription,
  ] = await Promise.all([
    prisma.autoReplyRule.count({ where: { workspaceId } }),
    prisma.whatsAppConnection.count({ where: { workspaceId } }),
    prisma.incomingMessageLog.count({ where: { workspaceId } }),
    prisma.outgoingMessageLog.count({ where: { workspaceId } }),
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

  return {
    rulesCount,
    connectionsCount,
    messageLogCount: incomingCount + outgoingCount,
    subscription,
  };
}
