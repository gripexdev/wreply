import "dotenv/config";

import {
  AutoReplyRuleLanguage,
  AutoReplyRuleMatchType,
  IncomingMessageProcessingStatus,
  OutgoingReplySource,
  OutgoingMessageStatus,
  PrismaClient,
  SubscriptionStatus,
  UserRole,
  WhatsAppConnectionStatus,
  WhatsAppProvider,
} from "@prisma/client";
import { hash } from "bcryptjs";

import { encryptSecretValue } from "../src/lib/whatsapp/secrets";

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
      replyDisplayName: "Atlas Motors team",
      businessPhoneNumber: "+212600000000",
      address: "201 Boulevard Ghandi, Casablanca",
      googleMapsLink:
        "https://maps.google.com/?q=201+Boulevard+Ghandi+Casablanca",
      workingHours: "Monday to Saturday, 9:00 to 19:00",
      languagePreference: AutoReplyRuleLanguage.ANY,
      fallbackReplyEnabled: true,
      fallbackReplyMessage:
        "Salam 👋 thanks for your message. We received it and our team will reply as soon as possible.",
    },
    create: {
      name: "Atlas Motors",
      slug: "atlas-motors",
      ownerId: owner.id,
      replyDisplayName: "Atlas Motors team",
      businessPhoneNumber: "+212600000000",
      address: "201 Boulevard Ghandi, Casablanca",
      googleMapsLink:
        "https://maps.google.com/?q=201+Boulevard+Ghandi+Casablanca",
      workingHours: "Monday to Saturday, 9:00 to 19:00",
      languagePreference: AutoReplyRuleLanguage.ANY,
      fallbackReplyEnabled: true,
      fallbackReplyMessage:
        "Salam 👋 thanks for your message. We received it and our team will reply as soon as possible.",
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
    where: { workspaceId: workspace.id },
    update: {
      label: "Main showroom line",
      phoneNumber: "+212600000000",
      phoneNumberId: "seed-phone-number-id-atlas",
      businessAccountId: "seed-business-account-atlas",
      provider: WhatsAppProvider.CLOUD_API,
      status: WhatsAppConnectionStatus.CONNECTED,
      verifyTokenEncrypted: encryptSecretValue("atlas-verify-token"),
      webhookKey: "atlas-webhook-key",
      webhookSubscribed: true,
      sendRepliesEnabled: false,
      lastVerifiedAt: new Date(),
    },
    create: {
      workspaceId: workspace.id,
      label: "Main showroom line",
      phoneNumber: "+212600000000",
      phoneNumberId: "seed-phone-number-id-atlas",
      businessAccountId: "seed-business-account-atlas",
      provider: WhatsAppProvider.CLOUD_API,
      status: WhatsAppConnectionStatus.CONNECTED,
      providerReference: "seed-connection-atlas",
      verifyTokenEncrypted: encryptSecretValue("atlas-verify-token"),
      webhookKey: "atlas-webhook-key",
      webhookSubscribed: true,
      sendRepliesEnabled: false,
      lastVerifiedAt: new Date(),
      lastHeartbeatAt: new Date(),
    },
  });

  const seededRuleIds = new Map<string, string>();

  const seededRules = [
    {
      keyword: "price",
      replyMessage:
        "Salam. For pricing, send the product name or a photo and our team will reply quickly with the right offer.",
      matchType: AutoReplyRuleMatchType.CONTAINS,
      language: AutoReplyRuleLanguage.ANY,
      category: "Sales",
      priority: 1,
      isActive: true,
    },
    {
      keyword: "prix",
      replyMessage:
        "Bonjour. Pour le prix, merci d envoyer le nom du produit ou une photo et nous vous repondrons rapidement.",
      matchType: AutoReplyRuleMatchType.CONTAINS,
      language: AutoReplyRuleLanguage.FRENCH,
      category: "Sales",
      priority: 2,
      isActive: true,
    },
    {
      keyword: "fin",
      replyMessage:
        "Rahna f 201 Boulevard Ghandi, Casablanca. Hna Google Maps: https://maps.google.com/?q=201+Boulevard+Ghandi+Casablanca",
      matchType: AutoReplyRuleMatchType.CONTAINS,
      language: AutoReplyRuleLanguage.DARIJA,
      category: "Store info",
      priority: 3,
      isActive: true,
    },
    {
      keyword: "stock",
      replyMessage:
        "Merci. Send the product name and we will confirm stock availability before you place the order.",
      matchType: AutoReplyRuleMatchType.CONTAINS,
      language: AutoReplyRuleLanguage.ANY,
      category: "Inventory",
      priority: 4,
      isActive: true,
    },
    {
      keyword: "livraison",
      replyMessage:
        "La livraison est disponible dans Casablanca et les grandes villes. Envoyez votre quartier pour confirmer le delai.",
      matchType: AutoReplyRuleMatchType.CONTAINS,
      language: AutoReplyRuleLanguage.FRENCH,
      category: "Delivery",
      priority: 5,
      isActive: true,
    },
    {
      keyword: "horaires",
      replyMessage:
        "Ma3akoum mn ltnin l s-sbt, men 9:00 l 19:00. Ila bghiti rendez-vous, sift lina l-wa9t li kaynseb lik.",
      matchType: AutoReplyRuleMatchType.CONTAINS,
      language: AutoReplyRuleLanguage.DARIJA,
      category: "Store info",
      priority: 6,
      isActive: true,
    },
  ];

  for (const rule of seededRules) {
    const createdRule = await prisma.autoReplyRule.upsert({
      where: {
        workspaceId_keyword_matchType_language: {
          workspaceId: workspace.id,
          keyword: rule.keyword,
          matchType: rule.matchType,
          language: rule.language,
        },
      },
      update: {
        replyMessage: rule.replyMessage,
        category: rule.category,
        priority: rule.priority,
        isActive: rule.isActive,
      },
      create: {
        workspaceId: workspace.id,
        ...rule,
      },
    });

    seededRuleIds.set(rule.keyword, createdRule.id);
  }

  const matchedIncomingLog = await prisma.incomingMessageLog.upsert({
    where: { externalMessageId: "seed-incoming-001" },
    update: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      contactName: "Yassine",
      senderPhone: "+212611111111",
      recipientPhone: "+212600000000",
      content: "What are your opening hours?",
      normalizedContent: "what are your opening hours",
      matchedRuleId: seededRuleIds.get("horaires"),
      processingStatus: IncomingMessageProcessingStatus.MATCHED,
      processingReason: "Seeded sample matched the horaires rule.",
      fallbackEligible: false,
      fallbackUsed: false,
      processedAt: new Date(),
    },
    create: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      externalMessageId: "seed-incoming-001",
      contactName: "Yassine",
      senderPhone: "+212611111111",
      recipientPhone: "+212600000000",
      content: "What are your opening hours?",
      normalizedContent: "what are your opening hours",
      matchedRuleId: seededRuleIds.get("horaires"),
      processingStatus: IncomingMessageProcessingStatus.MATCHED,
      processingReason: "Seeded sample matched the horaires rule.",
      fallbackEligible: false,
      fallbackUsed: false,
      processedAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  await prisma.outgoingMessageLog.upsert({
    where: { externalMessageId: "seed-outgoing-001" },
    update: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      matchedRuleId: seededRuleIds.get("horaires"),
      relatedIncomingMessageId: matchedIncomingLog.id,
      recipientPhone: "+212611111111",
      content: "We are open Monday to Saturday from 9:00 to 19:00.",
      status: OutgoingMessageStatus.DELIVERED,
      replySource: OutgoingReplySource.RULE_MATCH,
      sentAt: new Date(),
    },
    create: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      externalMessageId: "seed-outgoing-001",
      matchedRuleId: seededRuleIds.get("horaires"),
      relatedIncomingMessageId: matchedIncomingLog.id,
      recipientPhone: "+212611111111",
      content: "We are open Monday to Saturday from 9:00 to 19:00.",
      status: OutgoingMessageStatus.DELIVERED,
      replySource: OutgoingReplySource.RULE_MATCH,
      sentAt: new Date(),
    },
  });

  const fallbackIncomingLog = await prisma.incomingMessageLog.upsert({
    where: { externalMessageId: "seed-incoming-002" },
    update: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      contactName: "Imane",
      senderPhone: "+212633333333",
      recipientPhone: "+212600000000",
      content: "Salam, bghit n3ref kifach n9der ndir rendez-vous",
      normalizedContent: "salam bghit n3ref kifach n9der ndir rendez vous",
      matchedRuleId: null,
      processingStatus: IncomingMessageProcessingStatus.NO_MATCH,
      processingReason:
        "No active workspace rule matched the normalized message. A workspace fallback reply was prepared.",
      fallbackEligible: true,
      fallbackUsed: true,
      processedAt: new Date(),
    },
    create: {
      workspaceId: workspace.id,
      whatsAppConnectionId: connection.id,
      externalMessageId: "seed-incoming-002",
      contactName: "Imane",
      senderPhone: "+212633333333",
      recipientPhone: "+212600000000",
      content: "Salam, bghit n3ref kifach n9der ndir rendez-vous",
      normalizedContent: "salam bghit n3ref kifach n9der ndir rendez vous",
      matchedRuleId: null,
      processingStatus: IncomingMessageProcessingStatus.NO_MATCH,
      processingReason:
        "No active workspace rule matched the normalized message. A workspace fallback reply was prepared.",
      fallbackEligible: true,
      fallbackUsed: true,
      processedAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  const existingFallbackOutgoingLog = await prisma.outgoingMessageLog.findFirst({
    where: {
      workspaceId: workspace.id,
      relatedIncomingMessageId: fallbackIncomingLog.id,
      replySource: OutgoingReplySource.FALLBACK,
    },
    select: {
      id: true,
    },
  });

  if (existingFallbackOutgoingLog) {
    await prisma.outgoingMessageLog.update({
      where: {
        id: existingFallbackOutgoingLog.id,
      },
      data: {
        workspaceId: workspace.id,
        whatsAppConnectionId: connection.id,
        matchedRuleId: null,
        relatedIncomingMessageId: fallbackIncomingLog.id,
        externalMessageId: null,
        recipientPhone: "+212633333333",
        content:
          "Salam 👋 thanks for your message. We received it and our team will reply as soon as possible.",
        status: OutgoingMessageStatus.PREPARED,
        replySource: OutgoingReplySource.FALLBACK,
        failureReason:
          "Live WhatsApp sending is disabled for this workspace connection.",
        sentAt: null,
      },
    });
  } else {
    await prisma.outgoingMessageLog.create({
      data: {
        workspaceId: workspace.id,
        whatsAppConnectionId: connection.id,
        matchedRuleId: null,
        relatedIncomingMessageId: fallbackIncomingLog.id,
        recipientPhone: "+212633333333",
        content:
          "Salam 👋 thanks for your message. We received it and our team will reply as soon as possible.",
        status: OutgoingMessageStatus.PREPARED,
        replySource: OutgoingReplySource.FALLBACK,
        failureReason:
          "Live WhatsApp sending is disabled for this workspace connection.",
        sentAt: null,
      },
    });
  }

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
