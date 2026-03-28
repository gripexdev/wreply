import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWhatsAppWebhookSignature(input: {
  appSecret: string;
  rawBody: string;
  signatureHeader: string | null;
}) {
  const { appSecret, rawBody, signatureHeader } = input;

  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const providedSignature = signatureHeader.slice("sha256=".length);
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const providedBuffer = Buffer.from(providedSignature, "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
