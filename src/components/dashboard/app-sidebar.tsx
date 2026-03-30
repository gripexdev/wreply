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
        "surface-glow relative flex h-full flex-col rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(9,14,24,0.96),rgba(7,10,18,0.98))] p-4 backdrop-blur-2xl",
        className,
      )}
    >
      <Brand />

      <div className="mt-6 rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(13,19,32,0.88),rgba(8,12,22,0.96))] p-4">
        <p className="text-[0.64rem] tracking-[0.24em] text-white/36 uppercase">
          Workspace
        </p>
        <p className="font-display mt-3 text-[1.2rem] font-semibold tracking-[-0.03em] text-white">
          {workspaceName}
        </p>
        <p className="mt-1 text-xs text-white/42">{user.email}</p>
      </div>

      <nav className="mt-6 space-y-1.5">
        {dashboardNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-[22px] border px-3 py-3 transition-all duration-200",
                isActive
                  ? "border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,28,48,0.98),rgba(10,16,28,0.96))] text-white shadow-[0_0_30px_-18px_rgba(34,211,238,0.28),0_0_36px_-20px_rgba(59,130,246,0.24)]"
                  : "border-transparent text-white/56 hover:border-white/[0.08] hover:bg-white/[0.03] hover:text-white",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-3 left-1 hidden w-px rounded-full bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(59,130,246,0.9),rgba(168,85,247,0.08))] lg:block",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[16px] border transition-all duration-200",
                  isActive
                    ? "text-secondary-accent border-white/[0.08] bg-[linear-gradient(180deg,rgba(59,130,246,0.16),rgba(34,211,238,0.12))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_24px_-16px_rgba(34,211,238,0.32)]"
                    : "border-white/[0.08] bg-white/[0.03] text-white/60 group-hover:border-white/[0.12] group-hover:text-white/88",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 text-sm font-semibold tracking-[-0.01em] text-white">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <SignOutButton className="w-full" />
      </div>
    </aside>
  );
}
