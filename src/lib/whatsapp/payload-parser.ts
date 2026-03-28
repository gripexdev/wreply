import type { ParsedWhatsAppTextMessage } from "@/types/whatsapp";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toReceivedAt(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const unixTimestamp = Number(value);

  if (!Number.isFinite(unixTimestamp)) {
    return null;
  }

  return new Date(unixTimestamp * 1000).toISOString();
}

export function parseWhatsAppTextMessages(payload: unknown) {
  if (!isRecord(payload) || payload.object !== "whatsapp_business_account") {
    return {
      textMessages: [] as ParsedWhatsAppTextMessage[],
      ignoredEvents: 0,
    };
  }

  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const textMessages: ParsedWhatsAppTextMessage[] = [];
  let ignoredEvents = 0;

  for (const entry of entries) {
    if (!isRecord(entry)) {
      ignoredEvents += 1;
      continue;
    }

    const changes = Array.isArray(entry.changes) ? entry.changes : [];

    for (const change of changes) {
      if (!isRecord(change) || change.field !== "messages") {
        ignoredEvents += 1;
        continue;
      }

      const value = isRecord(change.value) ? change.value : null;
      const metadata = value && isRecord(value.metadata) ? value.metadata : null;
      const phoneNumberId =
        metadata && typeof metadata.phone_number_id === "string"
          ? metadata.phone_number_id
          : null;
      const displayPhoneNumber =
        metadata && typeof metadata.display_phone_number === "string"
          ? metadata.display_phone_number
          : null;
      const contacts = value && Array.isArray(value.contacts) ? value.contacts : [];
      const messages = value && Array.isArray(value.messages) ? value.messages : [];

      if (messages.length === 0) {
        ignoredEvents += 1;
        continue;
      }

      for (const message of messages) {
        if (!isRecord(message) || message.type !== "text") {
          ignoredEvents += 1;
          continue;
        }

        const text = isRecord(message.text) ? message.text : null;
        const body = text && typeof text.body === "string" ? text.body : null;
        const externalMessageId =
          typeof message.id === "string" ? message.id : null;
        const senderPhone =
          typeof message.from === "string" ? message.from : null;

        if (!body || !externalMessageId || !senderPhone) {
          ignoredEvents += 1;
          continue;
        }

        const customerName =
          contacts
            .map((contact) =>
              isRecord(contact) && isRecord(contact.profile)
                ? contact.profile.name
                : null,
            )
            .find((name): name is string => typeof name === "string") ?? null;

        textMessages.push({
          externalMessageId,
          phoneNumberId,
          displayPhoneNumber,
          senderPhone,
          recipientPhone: displayPhoneNumber ?? "",
          messageText: body,
          customerName,
          receivedAt: toReceivedAt(message.timestamp),
          payloadFragment: message,
        });
      }
    }
  }

  return {
    textMessages,
    ignoredEvents,
  };
}
