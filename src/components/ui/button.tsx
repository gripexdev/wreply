import * as React from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_18px_45px_-18px_rgba(30,181,142,0.9)] hover:bg-[#17a77f]",
  secondary:
    "border border-white/15 bg-white/5 text-foreground hover:bg-white/10",
  ghost: "text-foreground hover:bg-white/8",
  danger:
    "bg-rose-500 text-white shadow-[0_18px_45px_-18px_rgba(244,63,94,0.75)] hover:bg-rose-400",
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
    "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
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
