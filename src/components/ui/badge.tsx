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
        "inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.045] px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.22em] text-white/72 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </span>
  );
}
