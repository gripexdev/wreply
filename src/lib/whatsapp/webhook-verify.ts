export function verifyWhatsAppWebhookChallenge(input: {
  mode: string | null;
  challenge: string | null;
  verifyToken: string | null;
  expectedVerifyToken: string | null;
}) {
  const { mode, challenge, verifyToken, expectedVerifyToken } = input;

  if (
    mode !== "subscribe" ||
    !challenge ||
    !verifyToken ||
    !expectedVerifyToken
  ) {
    return null;
  }

  return verifyToken === expectedVerifyToken ? challenge : null;
}
