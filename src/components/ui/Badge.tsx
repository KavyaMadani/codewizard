import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "neutral"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "sm" | "md";
  dot?: boolean;
  pulseDot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  pulseDot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    neutral: "bg-slate-800/80 border-white/[0.08] text-slate-300",
    outline: "bg-transparent border-white/[0.14] text-slate-300",
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    danger: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    info: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  };

  const dotColors = {
    default: "bg-emerald-400",
    neutral: "bg-slate-400",
    outline: "bg-slate-300",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-cyan-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-medium rounded-md border tracking-tight transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulseDot && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColors[variant]
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-1.5 w-1.5",
              dotColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
