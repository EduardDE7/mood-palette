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
      default: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
      outline:
        "border border-input bg-transparent hover:bg-zinc-100 hover:text-accent-foreground dark:hover:bg-zinc-800",
      ghost:
        "hover:bg-zinc-100 hover:text-accent-foreground dark:hover:bg-zinc-800 bg-transparent",
      link: "text-primary underline-offset-4 hover:underline",
      action:
        "hover:bg-black/10 hover:scale-110 active:scale-95 transition-all bg-transparent",
      danger:
        "text-red-500 hover:bg-red-500/10 hover:scale-110 active:scale-95 transition-all bg-transparent",
      premium:
        "bg-primary text-primary-foreground shadow-2xl hover:opacity-90 hover:shadow-primary/20",
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
          "focus-visible:ring-ring inline-flex items-center justify-center gap-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50",
          round ? "rounded-full" : "rounded-md",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
