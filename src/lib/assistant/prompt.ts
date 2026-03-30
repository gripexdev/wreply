import type { WorkspaceAssistantContext } from "@/types/assistant";

export const AI_SAFE_FALLBACK_REPLY = "Please send more details 🙌";

function buildBusinessProfile(context: WorkspaceAssistantContext) {
  const profileLines = [
    `Business name: ${context.businessName}`,
    context.replyDisplayName
      ? `Reply display name: ${context.replyDisplayName}`
      : null,
    context.businessPhoneNumber
      ? `Contact phone: ${context.businessPhoneNumber}`
      : null,
    context.address ? `Address: ${context.address}` : null,
    context.googleMapsLink
      ? `Google Maps link: ${context.googleMapsLink}`
      : null,
    context.workingHours ? `Working hours: ${context.workingHours}` : null,
    `Default language preference: ${context.languagePreference}`,
    context.websiteUrl ? `Website URL: ${context.websiteUrl}` : null,
  ].filter((value): value is string => Boolean(value));

  return profileLines.join("\n");
}

function buildKnowledgeBlocks(context: WorkspaceAssistantContext) {
  const blocks = [
    context.manualKnowledge
      ? `Manual business info:\n${context.manualKnowledge}`
      : null,
    context.websiteContent
      ? `Website knowledge:\n${context.websiteContent}`
      : null,
  ].filter((value): value is string => Boolean(value));

  return blocks.join("\n\n");
}

export function buildAssistantPrompt(input: {
  context: WorkspaceAssistantContext;
  customerMessage: string;
}) {
  return {
    instructions: [
      `You are the WhatsApp assistant for ${input.context.businessName}.`,
      "Reply like a business owner or trusted team member.",
      "Keep the answer concise, friendly, and practical.",
      "If the customer writes in Darija or French, reply in the same language when possible.",
      "Use only the business profile and knowledge provided below.",
      "Do not invent prices, stock, policies, hours, or promises that are not present in the knowledge.",
      `If the knowledge is missing or not enough to answer, reply with exactly: ${AI_SAFE_FALLBACK_REPLY}`,
      "Keep the final reply under three short sentences.",
    ].join(" "),
    input: [
      `Business profile:\n${buildBusinessProfile(input.context)}`,
      `Business knowledge:\n${buildKnowledgeBlocks(input.context)}`,
      `Customer message:\n${input.customerMessage.trim()}`,
    ].join("\n\n"),
  };
}
