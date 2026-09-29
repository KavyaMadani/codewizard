import React from "react";
import { ChallengeStatus, ChallengeLifecycleStatus, SubmissionStatus } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Flame, Play, Sparkles, Calendar } from "lucide-react";

export type ExtendedStatus =
  | ChallengeStatus
  | ChallengeLifecycleStatus
  | SubmissionStatus
  | "under_review"
  | "approved";

export interface StatusBadgeProps {
  status: ExtendedStatus | string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  const configs: Record<
    string,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      style: string;
    }
  > = {
    active: {
      label: "Active",
      icon: Sparkles,
      style: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    },
    upcoming: {
      label: "Upcoming",
      icon: Calendar,
      style: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      style: "bg-slate-800/90 border-white/[0.12] text-slate-300",
    },
    not_started: {
      label: "Not Started",
      icon: Play,
      style: "bg-slate-800/80 border-white/[0.1] text-slate-300",
    },
    available: {
      label: "Available",
      icon: Play,
      style: "bg-slate-800/80 border-white/[0.1] text-slate-300",
    },
    in_progress: {
      label: "In Progress",
      icon: Flame,
      style: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    },
    submitted: {
      label: "Submitted",
      icon: Clock,
      style: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
    },
    under_review: {
      label: "Under Review",
      icon: Clock,
      style: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    },
    approved: {
      label: "Completed",
      icon: CheckCircle2,
      style: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    },
  };

  const current = configs[normalized] || {
    label: status,
    icon: Sparkles,
    style: "bg-slate-800/80 border-white/[0.1] text-slate-300",
  };
  const Icon = current.icon;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-mono font-medium tracking-tight",
        current.style,
        sizeStyles[size],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
}
