import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface FoundationItem {
  title: string;
  description: string;
  icon: LucideIcon;
}
