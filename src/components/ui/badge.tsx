import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
