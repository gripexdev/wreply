import * as React from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "border-transparent bg-[linear-gradient(135deg,#63e8c5_0%,#35d0bc_48%,#2f8fff_100%)] text-slate-950 shadow-[0_24px_60px_-28px_rgba(47,143,255,0.6),0_18px_45px_-24px_rgba(68,216,180,0.6)] hover:brightness-[1.05] hover:shadow-[0_26px_70px_-30px_rgba(47,143,255,0.7),0_22px_52px_-26px_rgba(68,216,180,0.7)]",
  secondary:
    "border-white/[0.1] bg-[linear-gradient(180deg,rgba(18,26,43,0.92),rgba(10,15,25,0.96))] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.14] hover:bg-[linear-gradient(180deg,rgba(24,33,54,0.95),rgba(11,17,28,0.98))] hover:shadow-[0_18px_45px_-32px_rgba(0,0,0,0.92)]",
  ghost:
    "border-transparent bg-transparent text-white/88 hover:bg-white/[0.055] hover:text-white",
  danger:
    "border-transparent bg-[linear-gradient(135deg,#fb7185_0%,#f43f5e_56%,#be123c_100%)] text-white shadow-[0_22px_48px_-26px_rgba(244,63,94,0.6)] hover:brightness-[1.04]",
};

const sizeStyles = {
  default: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "h-11 w-11",
};

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export function buttonStyles({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-[18px] border font-medium tracking-[-0.01em] transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45",
    sizeStyles[size],
    variantStyles[variant],
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
