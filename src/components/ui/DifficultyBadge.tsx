import React from "react";
import { Difficulty } from "@/types";
import { cn } from "@/lib/utils";

export interface DifficultyBadgeProps {
  difficulty: Difficulty;
  showPips?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  showPips = true,
  size = "md",
  className,
}: DifficultyBadgeProps) {
  const normalized = (
    difficulty === "Easy" ? "Easy" :
    difficulty === "Medium" ? "Medium" :
    difficulty === "Hard" ? "Hard" :
    difficulty === "Beginner" ? "Easy" :
    difficulty === "Intermediate" ? "Medium" :
    difficulty === "Advanced" ? "Hard" : "Medium"
  );

  const config = {
    Easy: {
      text: "Easy",
      badgeStyle: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
      activePip: "bg-emerald-400",
      count: 1,
    },
    Medium: {
      text: "Medium",
      badgeStyle: "bg-amber-500/10 border-amber-500/25 text-amber-400",
      activePip: "bg-amber-400",
      count: 2,
    },
    Hard: {
      text: "Hard",
      badgeStyle: "bg-rose-500/10 border-rose-500/25 text-rose-400",
      activePip: "bg-rose-400",
      count: 3,
    },
  }[normalized];

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-mono font-medium tracking-tight",
        config.badgeStyle,
        sizeStyles[size],
        className
      )}
    >
      {showPips && (
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3].map((level) => (
            <span
              key={level}
              className={cn(
                "h-2 w-1 rounded-[1px] transition-colors",
                level <= config.count ? config.activePip : "bg-white/10"
              )}
            />
          ))}
        </span>
      )}
      <span>{config.text}</span>
    </span>
  );
}
