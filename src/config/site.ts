import { env } from "@/config/env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description:
    "Production-ready SaaS foundation for WhatsApp auto-replies and FAQ automation for Moroccan businesses.",
  url: env.NEXT_PUBLIC_APP_URL,
  tagline: "WhatsApp Auto-Reply and FAQ automation for Moroccan businesses.",
};
