"use client";

import React from "react";
import { Card, Badge as StatusBadge } from "@/components/ui";
import { CheckCircle2, Lock, ChevronRight } from "lucide-react";
import { Badge } from "@/types";

export interface AchievementCardProps {
  badge: Badge;
  isUnlocked?: boolean;
  onClick?: () => void;
}

export function AchievementCard({
  badge,
  isUnlocked = false,
  onClick,
}: AchievementCardProps) {
  const percent = badge.progress
    ? Math.min(100, Math.round((badge.progress.current / badge.progress.total) * 100))
    : isUnlocked
    ? 100
    : 0;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
        isUnlocked
          ? "border-emerald-500/30 bg-[#111726]/90 hover:border-emerald-500/60 hover:bg-[#131d2e] shadow-sm hover:shadow-md hover:shadow-emerald-950/20"
          : "border-white/[0.06] bg-[#0e1320]/80 hover:border-white/[0.12] opacity-75 hover:opacity-100"
      }`}
    >
      <div>
        {/* Top: Emoji Icon & Status Chip */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-105 shadow-inner ${
              isUnlocked
                ? "bg-white/[0.05] border border-emerald-500/40 shadow-emerald-950/20"
                : "bg-white/[0.02] border border-white/[0.06] grayscale"
            }`}
          >
            {badge.emoji || "⭐"}
          </div>

          <div className="flex items-center gap-1.5">
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                <CheckCircle2 className="h-3 w-3" />
                UNLOCKED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-400 text-[10px] font-mono">
                <Lock className="h-3 w-3" />
                LOCKED
              </span>
            )}
          </div>
        </div>

        {/* Title & Category */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h4
              className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${
                isUnlocked
                  ? "text-white group-hover:text-emerald-300"
                  : "text-slate-300"
              }`}
            >
              {badge.name}
            </h4>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
          </div>

          <span className="text-[11px] font-mono text-slate-400 block">
            {badge.category} Track
          </span>

          <p className="text-xs text-slate-400 leading-relaxed pt-1 line-clamp-2">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Footer: Progress or Date */}
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        {isUnlocked && badge.unlockedAt ? (
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              Unlocked{" "}
              {new Date(badge.unlockedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        ) : badge.progress ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{badge.progress.label}</span>
              <span className="text-slate-300 font-semibold">{percent}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
              <div
                className="bg-emerald-500/80 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-slate-500">
            Click to view requirements
          </span>
        )}
      </div>
    </div>
  );
}
