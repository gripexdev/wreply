import { env } from "@/config/env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description: "Automatic WhatsApp replies for Moroccan businesses.",
  url: env.NEXT_PUBLIC_APP_URL,
  tagline: "Automatic WhatsApp replies for Moroccan businesses.",
};
