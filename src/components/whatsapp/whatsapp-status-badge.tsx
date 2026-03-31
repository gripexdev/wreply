import { Badge } from "@/components/ui/badge";
import { whatsappStatusMeta } from "@/config/whatsapp";
import type { WhatsAppUiStatus } from "@/types/whatsapp";

export function WhatsAppStatusBadge({
  status,
}: Readonly<{
  status: WhatsAppUiStatus;
}>) {
  const statusMeta = whatsappStatusMeta[status];

  return (
    <Badge className={statusMeta.badgeClassName}>{statusMeta.label}</Badge>
  );
}
