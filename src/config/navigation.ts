import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  MessagesSquare,
  MessageSquareQuote,
  Settings2,
  Smartphone,
} from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const dashboardNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Rules",
    href: "/dashboard/rules",
    icon: MessageSquareQuote,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessagesSquare,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "WhatsApp",
    href: "/dashboard/whatsapp",
    icon: Smartphone,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings2,
  },
];
