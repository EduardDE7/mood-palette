import * as React from "react";
import { cn } from "@/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "action"
    | "danger"
    | "premium";
  size?: "default" | "sm" | "lg" | "icon" | "xl";
  round?: boolean;
}

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
    const variants = {
      default: "glass-pill hover:bg-muted/60 shadow-sm transition-all",
      outline:
        "glass-pill bg-background/40 hover:bg-accent/40 shadow-sm transition-all",
      ghost:
        "hover:bg-accent/40 hover:shadow-sm text-foreground bg-transparent transition-all",
      link: "text-foreground underline-offset-4 hover:underline",
      action:
        "glass-pill bg-transparent border-transparent hover:scale-110 transition-all text-foreground shadow-none backdrop-blur-none",
      danger:
        "text-red-400 hover:bg-red-400/10 backdrop-blur-md hover:scale-110 transition-all bg-transparent",
      premium:
        "glass-card bg-primary/10 border-primary/20 text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-primary/20 hover:shadow-[0_8px_32px_rgba(255,255,255,0.02)] transition-all overflow-hidden relative",
    };

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
          "focus-visible:ring-ring inline-flex items-center justify-center gap-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          round ? "rounded-full" : "rounded-md",
          variants[variant],
          sizes[size],
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
