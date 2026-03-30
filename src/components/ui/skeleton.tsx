import { cn } from "@/lib/utils";

export function Skeleton({
  className,
}: Readonly<{
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-white/[0.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.9s_ease-in-out_infinite] before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]",
        className,
      )}
    />
  );
}
