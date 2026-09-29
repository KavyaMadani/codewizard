"use client";

import React, { useState } from "react";
import { Modal, Button, Badge as StatusBadge } from "@/components/ui";
import {
  Award,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Sparkles,
  Trophy,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Badge } from "@/types";

export interface BadgeDetailModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked?: boolean;
}

export function BadgeDetailModal({
  badge,
  isOpen,
  onClose,
  isUnlocked = false,
}: BadgeDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!badge) return null;

  const markdownSnippet = `[![${badge.name}](https://img.shields.io/badge/GitClub_CHARUSAT-${encodeURIComponent(
    badge.name
  )}-10b981?style=for-the-badge&logo=github)](https://gitclub.charusat.ac.in)`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(markdownSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-400" />
          <span>Badge Details</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          {isUnlocked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              className="text-xs font-mono"
            >
              {copied ? "Copied Markdown!" : "Copy for GitHub README"}
            </Button>
          ) : (
            <span className="text-xs font-mono text-slate-500">
              Complete requirements to unlock
            </span>
          )}

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-2">
        {/* Badge Hero Card */}
        <div className={`p-6 rounded-2xl border text-center space-y-3 relative overflow-hidden ${
          isUnlocked
            ? "border-emerald-500/40 bg-gradient-to-b from-[#131d2e] via-[#101726] to-[#0e1422] shadow-lg shadow-emerald-950/20"
            : "border-white/[0.08] bg-[#111726]/60 opacity-80"
        }`}>
          {/* Status Chip */}
          <div className="absolute top-3 right-3">
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                <CheckCircle2 className="h-3 w-3" />
                UNLOCKED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-slate-400 text-[10px] font-mono">
                <Lock className="h-3 w-3" />
                LOCKED
              </span>
            )}
          </div>

          {/* Large Emoji / Icon */}
          <div className="relative inline-block mx-auto">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-inner ${
              isUnlocked
                ? "bg-white/[0.06] border-2 border-emerald-500/50 shadow-emerald-950/30 ring-4 ring-emerald-500/20"
                : "bg-white/[0.02] border border-white/[0.08] grayscale"
            }`}>
              {badge.emoji || "🏆"}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              {badge.name}
            </h3>
            <span className="text-xs font-mono text-emerald-400 mt-0.5 block">
              {badge.category} Track
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {badge.description}
          </p>
        </div>

        {/* Progress or Unlock Date */}
        {isUnlocked && badge.unlockedAt ? (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="text-slate-400">Awarded On</span>
            <span className="text-emerald-400 font-semibold">
              {new Date(badge.unlockedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        ) : badge.progress ? (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Unlock Requirement</span>
              <span className="text-white font-semibold">{badge.progress.label}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/[0.06]">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((badge.progress.current / badge.progress.total) * 100))}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        {/* Community accreditation notice */}
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span>Accredited by Git Club CHARUSAT for academic & portfolio verification.</span>
        </div>
      </div>
    </Modal>
  );
}
