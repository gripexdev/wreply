import {
  BarChart3,
  Blocks,
  LayoutDashboard,
  MessagesSquare,
  MessageSquareQuote,
  Settings2,
  Smartphone,
} from "lucide-react";

import type { FoundationItem, NavigationItem } from "@/types/navigation";

export const dashboardNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Foundation overview and environment status.",
    icon: LayoutDashboard,
  },
  {
    title: "Rules",
    href: "/dashboard/rules",
    description: "Create, test, and reorder auto-reply rules.",
    icon: MessageSquareQuote,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    description:
      "Track volume, match rate, fallback usage, and delivery health.",
    icon: BarChart3,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    description: "Inspect inbound questions and outbound reply outcomes.",
    icon: MessagesSquare,
  },
  {
    title: "WhatsApp",
    href: "/dashboard/whatsapp",
    description: "Configure webhook delivery and inbound auto-replies.",
    icon: Smartphone,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    description: "Manage business details and fallback reply behavior.",
    icon: Settings2,
  },
];

export const foundationChecklist: FoundationItem[] = [
  {
    title: "Authentication base flow",
    description:
      "Credentials sign up, sign in, protected routing, and logout are wired end to end.",
    icon: Blocks,
  },
  {
    title: "Database foundation",
    description:
      "Prisma schema is structured for workspaces, plans, subscriptions, rules, messages, and WhatsApp connections.",
    icon: Blocks,
  },
  {
    title: "Scalable UI shell",
    description:
      "Marketing, auth, and protected app areas are split into clean App Router route groups.",
    icon: Blocks,
  },
];
