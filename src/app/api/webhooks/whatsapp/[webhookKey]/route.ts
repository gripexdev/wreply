import { NextRequest, NextResponse } from "next/server";

import {
  WhatsAppConnectionServiceError,
  WhatsAppWebhookServiceError,
} from "@/services/whatsapp/whatsapp-errors";
import {
  processWhatsAppWebhookRequest,
  verifyWhatsAppWebhookRequest,
} from "@/services/whatsapp/whatsapp-webhook.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ webhookKey: string }> },
) {
  try {
    const { webhookKey } = await context.params;
    const challenge = await verifyWhatsAppWebhookRequest({
      webhookKey,
      mode: request.nextUrl.searchParams.get("hub.mode"),
      challenge: request.nextUrl.searchParams.get("hub.challenge"),
      verifyToken: request.nextUrl.searchParams.get("hub.verify_token"),
    });

    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    if (
      error instanceof WhatsAppConnectionServiceError ||
      error instanceof WhatsAppWebhookServiceError
    ) {
      return new NextResponse(error.message, {
        status: error.statusCode,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    console.error(error);
    return new NextResponse("Unexpected webhook verification error.", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ webhookKey: string }> },
) {
  try {
    const { webhookKey } = await context.params;
    const rawBody = await request.text();
    const summary = await processWhatsAppWebhookRequest({
      webhookKey,
      rawBody,
      signatureHeader: request.headers.get("x-hub-signature-256"),
    });

    return NextResponse.json(
      {
        status: "EVENT_RECEIVED",
        summary,
      },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof WhatsAppConnectionServiceError ||
      error instanceof WhatsAppWebhookServiceError
    ) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    console.error(error);
    return NextResponse.json(
      {
        message: "Unexpected WhatsApp webhook processing error.",
      },
      { status: 500 },
    );
  }
}
