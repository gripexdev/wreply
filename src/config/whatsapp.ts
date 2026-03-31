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
    label: "Not ready",
    description: "Add your WhatsApp details to get started.",
    badgeClassName: "border-white/10 bg-white/[0.03] text-white",
  },
  requires_action: {
    label: "Needs attention",
    description: "A few details are still missing.",
    badgeClassName: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  },
  configured: {
    label: "Saved",
    description: "Your WhatsApp details are saved.",
    badgeClassName: "border-[#3B82F6]/20 bg-[#3B82F6]/10 text-[#DBEAFE]",
  },
  ready_for_testing: {
    label: "Ready to test",
    description: "You can start receiving messages.",
    badgeClassName: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  },
  webhook_active: {
    label: "Receiving messages",
    description: "Messages are coming in on this number.",
    badgeClassName: "border-primary/20 bg-primary/10 text-primary",
  },
};
