export class WhatsAppConnectionServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "WhatsAppConnectionServiceError";
  }
}

export class WhatsAppWebhookServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "WhatsAppWebhookServiceError";
  }
}
