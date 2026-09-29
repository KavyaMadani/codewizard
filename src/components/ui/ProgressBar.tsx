import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "emerald" | "cyan" | "amber" | "indigo";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  showPercentage = false,
  size = "md",
  variant = "emerald",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const barVariants = {
    emerald: "bg-emerald-500 shadow-sm shadow-emerald-500/30",
    cyan: "bg-cyan-500 shadow-sm shadow-cyan-500/30",
    amber: "bg-amber-500 shadow-sm shadow-amber-500/30",
    indigo: "bg-indigo-500 shadow-sm shadow-indigo-500/30",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showPercentage || sublabel) && (
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            {label && <span className="text-slate-300 font-medium">{label}</span>}
            {sublabel && <span className="text-slate-500">{sublabel}</span>}
          </div>
          {showPercentage && (
            <span className="text-slate-400 font-mono-num">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-800/80 border border-white/[0.05]",
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barVariants[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
