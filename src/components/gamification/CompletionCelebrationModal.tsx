"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, Button, Badge as StatusBadge } from "@/components/ui";
import {
  Trophy,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Award,
  Layers,
  Flame,
  Code2,
  Star,
  Rocket,
} from "lucide-react";
import { Badge } from "@/types";

export interface CompletionCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle?: string;
  xpEarned?: number;
  badgeUnlocked?: Badge;
  totalXp?: number;
  currentStreak?: number;
}

export function CompletionCelebrationModal({
  isOpen,
  onClose,
  challengeTitle = "Campus Event & Hackathon Finder",
  xpEarned = 500,
  badgeUnlocked,
  totalXp,
  currentStreak = 6,
}: CompletionCelebrationModalProps) {
  const [animatedXp, setAnimatedXp] = useState(0);

  // Subtle XP counter animation
  useEffect(() => {
    if (!isOpen) {
      setAnimatedXp(0);
      return;
    }

    const duration = 800; // 800ms smooth count up
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimatedXp(Math.round(progress * xpEarned));

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isOpen, xpEarned]);

  const defaultBadge: Badge = badgeUnlocked || {
    id: "badge-builder",
    name: "Builder",
    emoji: "🚀",
    description: "Shipped and deployed full-stack campus applications with live production demos.",
    icon: "Rocket",
    category: "Specialty",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="border-emerald-500/40 bg-gradient-to-b from-[#141e30] via-[#0f1726] to-[#0b101c] shadow-2xl shadow-emerald-950/40 overflow-hidden"
    >
      <div className="relative text-center py-2 sm:py-4 space-y-6">
        {/* Subtle Ambient Celebration Aura (Developer Sparks) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Celebration Header Icon */}
        <div className="relative inline-block mx-auto">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500/25 via-teal-500/20 to-amber-500/20 border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/30">
            <CheckCircle2 className="h-9 w-9 sm:h-11 sm:w-11 text-emerald-400 stroke-[2.5]" />
          </div>
          {/* Subtle spark indicators */}
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs">
            ✨
          </div>
        </div>

        {/* Title & Challenge */}
        <div className="space-y-1.5 px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono font-medium">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Challenge Completed!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verified & Evaluated
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto font-mono line-clamp-1">
            {challengeTitle}
          </p>
        </div>

        {/* Big XP Award Pill with subtle glow */}
        <div className="py-2">
          <div className="inline-flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-emerald-500/30 shadow-lg shadow-emerald-950/20 min-w-[200px]">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold mb-1">
              XP Accredited
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono-num flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-400 fill-amber-400/30 animate-pulse" />
              <span>+{animatedXp} XP</span>
            </div>
            {totalXp && (
              <span className="text-[11px] font-mono text-slate-400 mt-1">
                New Total: <strong className="text-white">{totalXp.toLocaleString()} XP</strong>
              </span>
            )}
          </div>
        </div>

        {/* New Badge Unlocked Section */}
        <div className="px-2 sm:px-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-500/30 text-left relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                  New Badge Unlocked
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                {defaultBadge.category}
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.1] text-2xl shrink-0 shadow-inner">
                {defaultBadge.emoji || "🚀"}
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <span>{defaultBadge.name}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  {defaultBadge.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill Row: Streak & Community Multiplier */}
        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-amber-400">
            <Flame className="h-3.5 w-3.5 fill-amber-400/30" />
            <span>{currentStreak}d Streak Kept</span>
          </span>
          <span>•</span>
          <span className="text-emerald-400">1.5x Multiplier Active</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link href="/leaderboard" onClick={onClose} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Trophy className="h-4 w-4" />}
              className="w-full sm:w-auto font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              View Leaderboard
            </Button>
          </Link>

          <Link href="/profile" onClick={onClose} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Award className="h-4 w-4" />}
              className="w-full sm:w-auto font-mono text-xs"
            >
              My Badges
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-mono text-slate-400 hover:text-white"
          >
            Continue Building
          </Button>
        </div>
      </div>
    </Modal>
  );
}
