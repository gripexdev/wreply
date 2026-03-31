import "dotenv/config";

import {
  AutoReplyRuleLanguage,
  AutoReplyRuleMatchType,
  BillingInterval,
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

function daysAgo(days: number, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);

  return date;
}

async function main() {
  const fallbackReplyMessage =
    "Salam, thanks for your message. We received it and our team will reply as soon as possible.";
  const assistantWebsiteUrl = "https://atlasmotors.ma";
  const assistantWebsiteContent = [
    "Atlas Motors sells inspected used cars in Casablanca.",
    "Customers can book a showroom visit or reserve a vehicle with a deposit after speaking with the team.",
    "After-sales support is available for maintenance questions and delivery coordination.",
    "For delivery, customers should share their city or neighborhood so the team can confirm the exact timing.",
  ].join(" ");
  const assistantManualKnowledge = [
    "The business offers after-sales help for paperwork, registration follow-up, and basic maintenance questions.",
    "For bookings, customers should send the car model, preferred visit time, and phone number.",
    "The team replies in Darija or French depending on the customer message.",
  ].join(" ");

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
      billingCustomerId: "seed-customer-atlas",
      replyDisplayName: "Atlas Motors team",
      businessPhoneNumber: "+212600000000",
      address: "201 Boulevard Ghandi, Casablanca",
      googleMapsLink:
        "https://maps.google.com/?q=201+Boulevard+Ghandi+Casablanca",
      workingHours: "Monday to Saturday, 9:00 to 19:00",
      languagePreference: AutoReplyRuleLanguage.ANY,
      fallbackReplyEnabled: true,
      fallbackReplyMessage,
      assistantWebsiteUrl,
      assistantWebsiteContent,
      assistantManualKnowledge,
      assistantKnowledgeUpdatedAt: daysAgo(0, 9, 0),
    },
    create: {
      name: "Atlas Motors",
      slug: "atlas-motors",
      ownerId: owner.id,
      billingCustomerId: "seed-customer-atlas",
      replyDisplayName: "Atlas Motors team",
      businessPhoneNumber: "+212600000000",
      address: "201 Boulevard Ghandi, Casablanca",
      googleMapsLink:
        "https://maps.google.com/?q=201+Boulevard+Ghandi+Casablanca",
      workingHours: "Monday to Saturday, 9:00 to 19:00",
      languagePreference: AutoReplyRuleLanguage.ANY,
      fallbackReplyEnabled: true,
      fallbackReplyMessage,
      assistantWebsiteUrl,
      assistantWebsiteContent,
      assistantManualKnowledge,
      assistantKnowledgeUpdatedAt: daysAgo(0, 9, 0),
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
      billingInterval: BillingInterval.MONTHLY,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      providerCustomerId: "seed-customer-atlas",
      providerPriceId: "price_seed_starter_monthly",
    },
    create: {
      workspaceId: workspace.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.TRIALING,
      billingInterval: BillingInterval.MONTHLY,
      providerSubscriptionId: "seed-subscription-atlas",
      providerCustomerId: "seed-customer-atlas",
      providerPriceId: "price_seed_starter_monthly",
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
      lastHeartbeatAt: new Date(),
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

  function getRuleId(keyword: string) {
    const ruleId = seededRuleIds.get(keyword);

    if (!ruleId) {
      throw new Error(`Missing seeded rule for keyword "${keyword}".`);
    }

    return ruleId;
  }

  const analyticsSamples = [
    {
      incoming: {
        externalMessageId: "seed-incoming-001",
        contactName: "Yassine",
        senderPhone: "+212611111111",
        recipientPhone: "+212600000000",
        content: "horaire svp",
        normalizedContent: "horaire svp",
        matchedRuleId: getRuleId("horaires"),
        processingStatus: IncomingMessageProcessingStatus.MATCHED,
        processingReason:
          "Matched the horaires rule from an opening-hours request.",
        fallbackEligible: false,
        fallbackUsed: false,
        receivedAt: daysAgo(42, 10, 15),
        processedAt: daysAgo(42, 10, 16),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-001",
        matchedRuleId: getRuleId("horaires"),
        recipientPhone: "+212611111111",
        content:
          "Ma3akoum mn ltnin l s-sbt, men 9:00 l 19:00. Ila bghiti rendez-vous, sift lina l-wa9t li kaynseb lik.",
        status: OutgoingMessageStatus.DELIVERED,
        replySource: OutgoingReplySource.RULE_MATCH,
        failureReason: null,
        createdAt: daysAgo(42, 10, 18),
        sentAt: daysAgo(42, 10, 22),
      },
    },
    {
      incoming: {
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
        receivedAt: daysAgo(18, 14, 10),
        processedAt: daysAgo(18, 14, 11),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-002",
        matchedRuleId: null,
        recipientPhone: "+212633333333",
        content: fallbackReplyMessage,
        status: OutgoingMessageStatus.PREPARED,
        replySource: OutgoingReplySource.FALLBACK,
        failureReason:
          "Live WhatsApp sending is disabled for this workspace connection.",
        createdAt: daysAgo(18, 14, 12),
        sentAt: null,
      },
    },
    {
      incoming: {
        externalMessageId: "seed-incoming-003",
        contactName: "Mehdi",
        senderPhone: "+212644444444",
        recipientPhone: "+212600000000",
        content: "prix clio",
        normalizedContent: "prix clio",
        matchedRuleId: getRuleId("price"),
        processingStatus: IncomingMessageProcessingStatus.MATCHED,
        processingReason: "Matched the price rule from a pricing request.",
        fallbackEligible: false,
        fallbackUsed: false,
        receivedAt: daysAgo(12, 11, 25),
        processedAt: daysAgo(12, 11, 26),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-003",
        matchedRuleId: getRuleId("price"),
        recipientPhone: "+212644444444",
        content:
          "Salam. For pricing, send the product name or a photo and our team will reply quickly with the right offer.",
        status: OutgoingMessageStatus.SENT,
        replySource: OutgoingReplySource.RULE_MATCH,
        failureReason: null,
        createdAt: daysAgo(12, 11, 29),
        sentAt: daysAgo(12, 11, 31),
      },
    },
    {
      incoming: {
        externalMessageId: "seed-incoming-004",
        contactName: "Salma",
        senderPhone: "+212655555555",
        recipientPhone: "+212600000000",
        content: "wach kayn stock dacia logan",
        normalizedContent: "wach kayn stock dacia logan",
        matchedRuleId: getRuleId("stock"),
        processingStatus: IncomingMessageProcessingStatus.MATCHED,
        processingReason:
          "Matched the stock rule from an availability request.",
        fallbackEligible: false,
        fallbackUsed: false,
        receivedAt: daysAgo(6, 16, 5),
        processedAt: daysAgo(6, 16, 6),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-004",
        matchedRuleId: getRuleId("stock"),
        recipientPhone: "+212655555555",
        content:
          "Merci. Send the product name and we will confirm stock availability before you place the order.",
        status: OutgoingMessageStatus.FAILED,
        replySource: OutgoingReplySource.RULE_MATCH,
        failureReason:
          "Meta rejected the send attempt for the current access token.",
        createdAt: daysAgo(6, 16, 9),
        sentAt: null,
      },
    },
    {
      incoming: {
        externalMessageId: "seed-incoming-005",
        contactName: "Karim",
        senderPhone: "+212666666666",
        recipientPhone: "+212600000000",
        content: "fin kayn lmagazin",
        normalizedContent: "fin kayn lmagazin",
        matchedRuleId: getRuleId("fin"),
        processingStatus: IncomingMessageProcessingStatus.MATCHED,
        processingReason:
          "Matched the location rule from a store-location request.",
        fallbackEligible: false,
        fallbackUsed: false,
        receivedAt: daysAgo(4, 9, 40),
        processedAt: daysAgo(4, 9, 41),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-005",
        matchedRuleId: getRuleId("fin"),
        recipientPhone: "+212666666666",
        content:
          "Rahna f 201 Boulevard Ghandi, Casablanca. Hna Google Maps: https://maps.google.com/?q=201+Boulevard+Ghandi+Casablanca",
        status: OutgoingMessageStatus.DELIVERED,
        replySource: OutgoingReplySource.RULE_MATCH,
        failureReason: null,
        createdAt: daysAgo(4, 9, 43),
        sentAt: daysAgo(4, 9, 47),
      },
    },
    {
      incoming: {
        externalMessageId: "seed-incoming-006",
        contactName: "Nadia",
        senderPhone: "+212677777777",
        recipientPhone: "+212600000000",
        content: "livraison casa?",
        normalizedContent: "livraison casa",
        matchedRuleId: getRuleId("livraison"),
        processingStatus: IncomingMessageProcessingStatus.MATCHED,
        processingReason:
          "Matched the livraison rule from a delivery coverage question.",
        fallbackEligible: false,
        fallbackUsed: false,
        receivedAt: daysAgo(2, 13, 20),
        processedAt: daysAgo(2, 13, 21),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-006",
        matchedRuleId: getRuleId("livraison"),
        recipientPhone: "+212677777777",
        content:
          "La livraison est disponible dans Casablanca et les grandes villes. Envoyez votre quartier pour confirmer le delai.",
        status: OutgoingMessageStatus.PREPARED,
        replySource: OutgoingReplySource.RULE_MATCH,
        failureReason:
          "Live WhatsApp sending is disabled for this workspace connection.",
        createdAt: daysAgo(2, 13, 24),
        sentAt: null,
      },
    },
    {
      incoming: {
        externalMessageId: "seed-incoming-007",
        contactName: "Zakaria",
        senderPhone: "+212688888888",
        recipientPhone: "+212600000000",
        content: "chhal taman captur",
        normalizedContent: "chhal taman captur",
        matchedRuleId: getRuleId("price"),
        processingStatus: IncomingMessageProcessingStatus.MATCHED,
        processingReason:
          "Matched the price rule from a Darija pricing question.",
        fallbackEligible: false,
        fallbackUsed: false,
        receivedAt: daysAgo(1, 10, 5),
        processedAt: daysAgo(1, 10, 6),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-007",
        matchedRuleId: getRuleId("price"),
        recipientPhone: "+212688888888",
        content:
          "Salam. For pricing, send the product name or a photo and our team will reply quickly with the right offer.",
        status: OutgoingMessageStatus.SENT,
        replySource: OutgoingReplySource.RULE_MATCH,
        failureReason: null,
        createdAt: daysAgo(1, 10, 8),
        sentAt: daysAgo(1, 10, 10),
      },
    },
    {
      incoming: {
        externalMessageId: "seed-incoming-008",
        contactName: "Hajar",
        senderPhone: "+212699999999",
        recipientPhone: "+212600000000",
        content: "salam wash 3ndkom service apres vente",
        normalizedContent: "salam wash 3ndkom service apres vente",
        matchedRuleId: null,
        processingStatus: IncomingMessageProcessingStatus.NO_MATCH,
        processingReason:
          "No active workspace rule matched the normalized message. A workspace fallback reply was prepared.",
        fallbackEligible: true,
        fallbackUsed: true,
        receivedAt: daysAgo(0, 15, 30),
        processedAt: daysAgo(0, 15, 31),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-008",
        matchedRuleId: null,
        recipientPhone: "+212699999999",
        content: fallbackReplyMessage,
        status: OutgoingMessageStatus.PREPARED,
        replySource: OutgoingReplySource.FALLBACK,
        failureReason:
          "Live WhatsApp sending is disabled for this workspace connection.",
        createdAt: daysAgo(0, 15, 33),
        sentAt: null,
      },
    },
    {
      incoming: {
        externalMessageId: "seed-incoming-009",
        contactName: "Omar",
        senderPhone: "+212612345678",
        recipientPhone: "+212600000000",
        content: "salam kayn service apres vente ?",
        normalizedContent: "salam kayn service apres vente",
        matchedRuleId: null,
        processingStatus: IncomingMessageProcessingStatus.NO_MATCH,
        processingReason:
          "No active workspace rule matched the normalized message. An AI knowledge reply was prepared from the workspace training data.",
        fallbackEligible: true,
        fallbackUsed: false,
        receivedAt: daysAgo(0, 17, 5),
        processedAt: daysAgo(0, 17, 6),
      },
      outgoing: {
        externalMessageId: "seed-outgoing-009",
        matchedRuleId: null,
        recipientPhone: "+212612345678",
        content:
          "Salam. Oui, nous aidons pour le suivi apres vente et les questions de maintenance de base. Envoyez le modele du vehicule et votre demande.",
        status: OutgoingMessageStatus.PREPARED,
        replySource: OutgoingReplySource.AI_KNOWLEDGE,
        failureReason:
          "Live WhatsApp sending is disabled for this workspace connection.",
        createdAt: daysAgo(0, 17, 8),
        sentAt: null,
      },
    },
  ];

  for (const sample of analyticsSamples) {
    const incomingLog = await prisma.incomingMessageLog.upsert({
      where: {
        externalMessageId: sample.incoming.externalMessageId,
      },
      update: {
        workspaceId: workspace.id,
        whatsAppConnectionId: connection.id,
        contactName: sample.incoming.contactName,
        senderPhone: sample.incoming.senderPhone,
        recipientPhone: sample.incoming.recipientPhone,
        content: sample.incoming.content,
        normalizedContent: sample.incoming.normalizedContent,
        matchedRuleId: sample.incoming.matchedRuleId,
        processingStatus: sample.incoming.processingStatus,
        processingReason: sample.incoming.processingReason,
        fallbackEligible: sample.incoming.fallbackEligible,
        fallbackUsed: sample.incoming.fallbackUsed,
        receivedAt: sample.incoming.receivedAt,
        processedAt: sample.incoming.processedAt,
      },
      create: {
        workspaceId: workspace.id,
        whatsAppConnectionId: connection.id,
        externalMessageId: sample.incoming.externalMessageId,
        contactName: sample.incoming.contactName,
        senderPhone: sample.incoming.senderPhone,
        recipientPhone: sample.incoming.recipientPhone,
        content: sample.incoming.content,
        normalizedContent: sample.incoming.normalizedContent,
        matchedRuleId: sample.incoming.matchedRuleId,
        processingStatus: sample.incoming.processingStatus,
        processingReason: sample.incoming.processingReason,
        fallbackEligible: sample.incoming.fallbackEligible,
        fallbackUsed: sample.incoming.fallbackUsed,
        receivedAt: sample.incoming.receivedAt,
        processedAt: sample.incoming.processedAt,
      },
      select: {
        id: true,
      },
    });

    await prisma.outgoingMessageLog.upsert({
      where: {
        externalMessageId: sample.outgoing.externalMessageId,
      },
      update: {
        workspaceId: workspace.id,
        whatsAppConnectionId: connection.id,
        matchedRuleId: sample.outgoing.matchedRuleId,
        relatedIncomingMessageId: incomingLog.id,
        recipientPhone: sample.outgoing.recipientPhone,
        content: sample.outgoing.content,
        status: sample.outgoing.status,
        replySource: sample.outgoing.replySource,
        failureReason: sample.outgoing.failureReason,
        createdAt: sample.outgoing.createdAt,
        sentAt: sample.outgoing.sentAt,
      },
      create: {
        workspaceId: workspace.id,
        whatsAppConnectionId: connection.id,
        externalMessageId: sample.outgoing.externalMessageId,
        matchedRuleId: sample.outgoing.matchedRuleId,
        relatedIncomingMessageId: incomingLog.id,
        recipientPhone: sample.outgoing.recipientPhone,
        content: sample.outgoing.content,
        status: sample.outgoing.status,
        replySource: sample.outgoing.replySource,
        failureReason: sample.outgoing.failureReason,
        createdAt: sample.outgoing.createdAt,
        sentAt: sample.outgoing.sentAt,
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
