import * as React from "react";
import { cn } from "@/utils";

export type ButtonVariant =
  | "default"
  | "header"
  | "white"
  | "outline"
  | "ghost"
  | "link"
  | "action"
  | "danger"
  | "premium";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "default" | "sm" | "lg" | "icon" | "xl";
  round?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  default:
    "border border-border/80 bg-muted/35 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl hover:border-border/90 hover:bg-muted/45 hover:shadow-[0_12px_32px_rgba(0,0,0,0.28)]",
  header:
    "border border-border/80 bg-muted/35 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl hover:border-border/90 hover:bg-muted/45 hover:shadow-[0_12px_32px_rgba(0,0,0,0.28)]",
  white:
    "border border-white/70 bg-white/95 text-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl hover:border-white/90 hover:bg-white",
  outline:
    "border border-white/70 bg-white/95 text-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl hover:border-white/90 hover:bg-white",
  ghost:
    "border border-transparent bg-transparent text-foreground shadow-none backdrop-blur-none hover:border-border/40 hover:bg-white/8 hover:shadow-none",
  link: "border border-transparent bg-transparent text-foreground underline-offset-4 hover:underline",
  action:
    "border border-border/50 bg-muted/20 text-foreground shadow-none backdrop-blur-xl hover:border-border/70 hover:bg-muted/30",
  danger:
    "border border-transparent bg-transparent text-red-400 shadow-none backdrop-blur-none hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300",
  premium:
    "glass-card bg-primary/10 border-primary/20 text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-primary/20 hover:shadow-[0_8px_32px_rgba(255,255,255,0.02)] overflow-hidden relative",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      round = false,
      ...props
    },
    ref
  ) => {
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-11 px-8",
      xl: "h-14 px-10 text-xl",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        className={cn(
          "focus-visible:ring-ring inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          round ? "rounded-full" : "rounded-md",
          variants[variant],
          sizes[size],
          variant === "ghost" && size === "icon"
            ? "border border-transparent bg-transparent text-current shadow-none backdrop-blur-none hover:border-white/35 hover:bg-white/10 hover:shadow-none active:scale-105"
            : "",
          className
        )}
        ref={ref}
        aria-label={props["aria-label"] || props.title}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
