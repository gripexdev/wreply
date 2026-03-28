import { Blocks, LayoutDashboard } from "lucide-react";

import type { FoundationItem, NavigationItem } from "@/types/navigation";

export const dashboardNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Foundation overview and environment status.",
    icon: LayoutDashboard,
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
