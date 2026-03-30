import type { WhatsAppUiStatus } from "@/types/whatsapp";

export const whatsappStatusMeta: Record<
  WhatsAppUiStatus,
  {
    label: string;
    description: string;
    badgeClassName: string;
  }
> = {
  not_configured: {
    label: "Not configured",
    description:
      "Save your phone number identifiers and verification token to activate webhook setup.",
    badgeClassName: "border-white/10 bg-white/[0.03] text-white",
  },
  requires_action: {
    label: "Requires action",
    description:
      "Some required setup fields are still missing before this connection can receive events safely.",
    badgeClassName: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  },
  configured: {
    label: "Configured",
    description:
      "Core webhook settings are saved. Complete remaining checklist items before enabling live replies.",
    badgeClassName: "border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#DBEAFE]",
  },
  ready_for_testing: {
    label: "Ready for testing",
    description:
      "Webhook settings are present and the connection is ready to receive inbound events.",
    badgeClassName: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  },
  webhook_active: {
    label: "Webhook active",
    description:
      "A recent webhook event was received for this connection, and inbound processing is operational.",
    badgeClassName: "border-primary/20 bg-primary/10 text-primary",
  },
};
