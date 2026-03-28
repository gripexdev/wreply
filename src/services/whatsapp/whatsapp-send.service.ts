interface SendWhatsAppTextMessageInput {
  accessToken: string;
  phoneNumberId: string;
  recipientPhone: string;
  messageBody: string;
}

interface SendWhatsAppTextMessageResult {
  ok: boolean;
  providerMessageId: string | null;
  payload: unknown;
  failureReason: string | null;
}

const graphApiVersion = "v22.0";

export async function sendWhatsAppTextMessage(
  input: SendWhatsAppTextMessageInput,
): Promise<SendWhatsAppTextMessageResult> {
  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion}/${input.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.recipientPhone,
        type: "text",
        text: {
          body: input.messageBody,
        },
      }),
    },
  );
  const payload = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!response.ok) {
    const errorDetails =
      payload && typeof payload.error === "object" && payload.error
        ? JSON.stringify(payload.error)
        : `WhatsApp API returned ${response.status}.`;

    return {
      ok: false,
      providerMessageId: null,
      payload,
      failureReason: errorDetails,
    };
  }

  const providerMessageId =
    Array.isArray(payload?.messages) &&
    typeof payload.messages[0] === "object" &&
    payload.messages[0] &&
    "id" in payload.messages[0] &&
    typeof payload.messages[0].id === "string"
      ? payload.messages[0].id
      : null;

  return {
    ok: true,
    providerMessageId,
    payload,
    failureReason: null,
  };
}
