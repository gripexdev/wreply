import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { env } from "@/config/env";

const algorithm = "aes-256-gcm";
const ivLength = 12;
const authTagLength = 16;

function getDerivedEncryptionKey() {
  return createHash("sha256")
    .update(env.NEXTAUTH_SECRET)
    .update("wreply-whatsapp-secrets")
    .digest();
}

export function encryptSecretValue(value: string) {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, getDerivedEncryptionKey(), iv);
  const encryptedValue = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encryptedValue]).toString("base64");
}

export function decryptSecretValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const payload = Buffer.from(value, "base64");
  const iv = payload.subarray(0, ivLength);
  const authTag = payload.subarray(ivLength, ivLength + authTagLength);
  const encryptedValue = payload.subarray(ivLength + authTagLength);
  const decipher = createDecipheriv(algorithm, getDerivedEncryptionKey(), iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encryptedValue),
    decipher.final(),
  ]).toString("utf8");
}

export function maskSecretValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value.length <= 8) {
    return "••••••••";
  }

  return `${"•".repeat(Math.min(10, Math.max(6, value.length - 4)))}${value.slice(-4)}`;
}
