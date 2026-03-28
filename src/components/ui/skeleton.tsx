import { cn } from "@/lib/utils";

export function Skeleton({
  className,
}: Readonly<{
  className?: string;
}>) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-white/8", className)} />
  );
}
