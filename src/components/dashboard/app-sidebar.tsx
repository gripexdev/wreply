"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Brand } from "@/components/common/brand";
import { dashboardNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { AppSessionUser } from "@/types/auth";

export function AppSidebar({
  user,
  workspaceName,
  onNavigate,
  className,
}: Readonly<{
  user: AppSessionUser;
  workspaceName: string;
  onNavigate?: () => void;
  className?: string;
}>) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-[32px] border border-white/10 bg-black/25 p-6 shadow-[0_40px_120px_-70px_rgba(8,14,28,0.95)] backdrop-blur-2xl",
        className,
      )}
    >
      <Brand />
      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
        <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
          Active workspace
        </p>
        <p className="font-display mt-3 text-xl font-semibold text-white">
          {workspaceName}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">{user.email}</p>
      </div>
      <nav className="mt-8 space-y-2">
        {dashboardNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-4 rounded-2xl px-4 py-3 transition",
                isActive
                  ? "bg-white/12 text-white shadow-[0_20px_40px_-28px_rgba(30,181,142,0.7)]"
                  : "text-muted-foreground hover:bg-white/6 hover:text-white",
              )}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {item.title}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-4">
        <div className="border-primary/20 bg-primary/10 rounded-[28px] border p-4">
          <p className="text-primary/80 text-xs tracking-[0.22em] uppercase">
            Foundation
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Auth, schema, Docker, and protected routing are ready for feature
            work.
          </p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
