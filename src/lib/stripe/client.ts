import Stripe from "stripe";

import { env } from "@/config/env";

declare global {
  var stripeClient: Stripe | undefined;
}

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return (
    globalThis.stripeClient ??
    new Stripe(env.STRIPE_SECRET_KEY, {
      appInfo: {
        name: "WReply",
      },
    })
  );
}

if (env.STRIPE_SECRET_KEY && !globalThis.stripeClient) {
  globalThis.stripeClient = getStripeClient();
}
