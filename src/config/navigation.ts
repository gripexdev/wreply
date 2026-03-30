import {
  BarChart3,
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
    description: "Overview",
    icon: LayoutDashboard,
  },
  {
    title: "Rules",
    href: "/dashboard/rules",
    description: "Automation",
    icon: MessageSquareQuote,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    description: "Signals",
    icon: BarChart3,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    description: "Activity",
    icon: MessagesSquare,
  },
  {
    title: "WhatsApp",
    href: "/dashboard/whatsapp",
    description: "Connection",
    icon: Smartphone,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    description: "Business",
    icon: Settings2,
  },
];
