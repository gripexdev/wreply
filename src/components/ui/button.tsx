import * as React from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "border-transparent bg-[linear-gradient(135deg,#3B82F6_0%,#22D3EE_100%)] text-[#03111F] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_22px_60px_-34px_rgba(59,130,246,0.34),0_16px_40px_-24px_rgba(34,211,238,0.34)] hover:scale-[1.01] hover:brightness-[1.04] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_26px_72px_-38px_rgba(59,130,246,0.38),0_18px_44px_-24px_rgba(34,211,238,0.4)]",
  secondary:
    "border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,18,30,0.72),rgba(7,11,20,0.9))] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:scale-[1.01] hover:border-white/[0.12] hover:bg-[linear-gradient(180deg,rgba(16,22,37,0.82),rgba(8,12,22,0.94))]",
  ghost:
    "border-transparent bg-transparent text-white/72 hover:scale-[1.01] hover:bg-white/[0.045] hover:text-white",
  danger:
    "border-transparent bg-[linear-gradient(135deg,#fb7185_0%,#f43f5e_56%,#be123c_100%)] text-white shadow-[0_18px_42px_-26px_rgba(244,63,94,0.42)] hover:scale-[1.01] hover:brightness-[1.03]",
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
