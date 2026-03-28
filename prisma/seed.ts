import "dotenv/config";

import {
  OutgoingMessageStatus,
  PrismaClient,
  RuleMatchMode,
  SubscriptionStatus,
  UserRole,
  WhatsAppConnectionStatus,
  WhatsAppProvider,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [starterPlan, growthPlan] = await Promise.all([
    prisma.plan.upsert({
      where: { slug: "starter" },
      update: {},
      create: {
        slug: "starter",
        name: "Starter",
        description:
          "For small Moroccan businesses getting started with WhatsApp automation.",
        monthlyPriceMad: 290,
        yearlyPriceMad: 2900,
        maxRules: 10,
        maxMonthlyMessages: 1500,
        maxWhatsAppConnections: 1,
      },
    }),
    prisma.plan.upsert({
      where: { slug: "growth" },
      update: {},
      create: {
        slug: "growth",
        name: "Growth",
        description:
          "For teams that need more automation volume and connection capacity.",
        monthlyPriceMad: 790,
        yearlyPriceMad: 7900,
        maxRules: 50,
        maxMonthlyMessages: 10000,
        maxWhatsAppConnections: 3,
      },
    }),
  ]);

  const passwordHash = await hash("Password123!", 12);

  const owner = await prisma.user.upsert({
    where: { email: "owner@wreply.ma" },
    update: {
      name: "Atlas Motors",
      passwordHash,
      role: UserRole.OWNER,
    },
    create: {
      email: "owner@wreply.ma",
      name: "Atlas Motors",
      passwordHash,
      role: UserRole.OWNER,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "atlas-motors" },
    update: {
      name: "Atlas Motors",
      ownerId: owner.id,
    },
    create: {
      name: "Atlas Motors",
      slug: "atlas-motors",
      ownerId: owner.id,
    },
  });

  await prisma.user.update({
    where: { id: owner.id },
    data: { workspaceId: workspace.id },
  });

  await prisma.subscription.upsert({
    where: { providerSubscriptionId: "seed-subscription-atlas" },
    update: {
      workspaceId: workspace.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.TRIALING,
    },
    create: {
      workspaceId: workspace.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.TRIALING,
      providerSubscriptionId: "seed-subscription-atlas",
      providerCustomerId: "seed-customer-atlas",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  const connection = await prisma.whatsAppConnection.upsert({
    where: { providerReference: "seed-connection-atlas" },
    update: {
      workspaceId: workspace.id,
      label: "Main showroom line",
      phoneNumber: "+212600000000",
      provider: WhatsAppProvider.CLOUD_API,
      status: WhatsAppConnectionStatus.CONNECTED,
    },
    create: {
      workspaceId: workspace.id,
      label: "Main showroom line",
      phoneNumber: "+212600000000",
      provider: WhatsAppProvider.CLOUD_API,
      status: WhatsAppConnectionStatus.CONNECTED,
      providerReference: "seed-connection-atlas",
      lastHeartbeatAt: new Date(),
    },
  });

  await prisma.autoReplyRule.createMany({
    data: [
      {
        workspaceId: workspace.id,
        name: "Business hours",
        description: "Foundational FAQ rule for hours and availability.",
        keywords: ["hour", "horaire", "wa9t", "open"],
        matchMode: RuleMatchMode.CONTAINS_ANY,
        responseTemplate:
          "Our showroom is open Monday to Saturday from 9:00 to 19:00.",
        priority: 10,
      },
      {
        workspaceId: workspace.id,
        name: "Location",
        description: "Foundational FAQ rule for directions.",
        keywords: ["location", "adresse", "fin kayn", "where"],
        matchMode: RuleMatchMode.CONTAINS_ANY,
        responseTemplate:
          "We are based in Casablanca and share directions directly on WhatsApp after qualification.",
        priority: 20,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.incomingMessageLog.upsert({
    where: { externalMessageId: "seed-incoming-001" },
    update: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      senderPhone: "+212611111111",
      recipientPhone: "+212600000000",
      content: "What are your opening hours?",
    },
    create: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      externalMessageId: "seed-incoming-001",
      senderPhone: "+212611111111",
      recipientPhone: "+212600000000",
      content: "What are your opening hours?",
    },
  });

  await prisma.outgoingMessageLog.upsert({
    where: { externalMessageId: "seed-outgoing-001" },
    update: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      recipientPhone: "+212611111111",
      content: "We are open Monday to Saturday from 9:00 to 19:00.",
      status: OutgoingMessageStatus.DELIVERED,
      sentAt: new Date(),
    },
    create: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      externalMessageId: "seed-outgoing-001",
      recipientPhone: "+212611111111",
      content: "We are open Monday to Saturday from 9:00 to 19:00.",
      status: OutgoingMessageStatus.DELIVERED,
      sentAt: new Date(),
    },
  });

  console.log(`Seed complete for workspace ${workspace.slug}`);
  console.log(`Starter plan: ${starterPlan.name}`);
  console.log(`Growth plan: ${growthPlan.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
