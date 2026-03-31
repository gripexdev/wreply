import { NextResponse } from "next/server";

import {
  BillingServiceError,
  handleStripeWebhook,
} from "@/services/billing/billing.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { message: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  try {
    await handleStripeWebhook(rawBody, signature);

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof BillingServiceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Could not process the Stripe event." },
      { status: 500 },
    );
  }
}
