"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useChallenges } from "@/context/ChallengeContext";
import {
  Button,
  Card,
  CardContent,
  Badge,
  DifficultyBadge,
  StatusBadge,
  ProgressBar,
  Avatar,
  EmptyState,
  useToast,
} from "@/components/ui";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Flame,
  FolderGit2,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Zap,
  Check,
  ChevronDown,
  Brain,
  Smartphone,
  Palette,
  Shield,
  Radio,
  Sliders,
  FileCheck,
  ShieldAlert,
  Lock,
  Cpu,
  ArrowDown,
} from "lucide-react";
import { ChallengeCategory, Badge as BadgeType } from "@/types";
import { BadgeDetailModal } from "@/components/gamification";

// Helper to get category icons
function getCategoryIcon(category: ChallengeCategory) {
  switch (category) {
    case "Web Development":
      return <FolderGit2 className="h-3.5 w-3.5" />;
    case "AI / ML":
      return <Brain className="h-3.5 w-3.5" />;
    case "App Development":
      return <Smartphone className="h-3.5 w-3.5" />;
    case "UI/UX":
      return <Palette className="h-3.5 w-3.5" />;
    case "Cybersecurity":
      return <Shield className="h-3.5 w-3.5" />;
    case "IoT":
      return <Radio className="h-3.5 w-3.5" />;
    default:
      return <Code2 className="h-3.5 w-3.5" />;
  }
}

// Helper to map badge icons dynamically
function renderBadgeIcon(iconName: string) {
  switch (iconName) {
    case "Target":
      return <Target className="h-5 w-5 text-emerald-400" />;
    case "ShieldAlert":
      return <ShieldAlert className="h-5 w-5 text-rose-400" />;
    case "Flame":
      return <Flame className="h-5 w-5 text-amber-400 fill-amber-400/20" />;
    case "Award":
      return <Award className="h-5 w-5 text-cyan-400" />;
    case "Trophy":
      return <Trophy className="h-5 w-5 text-amber-300" />;
    case "Code2":
      return <Code2 className="h-5 w-5 text-indigo-400" />;
    case "Sparkles":
      return <Sparkles className="h-5 w-5 text-purple-400" />;
    case "Lock":
      return <Lock className="h-5 w-5 text-rose-400" />;
    case "Cpu":
      return <Cpu className="h-5 w-5 text-teal-400" />;
    case "Zap":
      return <Zap className="h-5 w-5 text-amber-400 fill-amber-400/20" />;
    default:
      return <Award className="h-5 w-5 text-emerald-400" />;
  }
}

// Format ISO date into human-readable string
function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Format relative remaining days
function getDeadlineCountdown(deadlineStr?: string) {
  if (!deadlineStr) return null;
  try {
    const deadline = new Date(deadlineStr).getTime();
    // Using reference time aligned with app context (Late Sept 2026)
    const now = new Date("2026-09-29T17:00:00Z").getTime();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Due today";
    if (diffDays === 1) return "1 day remaining";
    return `${diffDays} days remaining`;
  } catch {
    return null;
  }
}

// Challenge Journey Lifecycle Stages (Exactly matching user specifications)
const JOURNEY_STAGES = [
  {
    id: "not_started",
    label: "Not Started",
    shortLabel: "Claim",
    description: "Challenge discovered in Arena. Repository initialized & dependencies ready.",
    tip: "Browse the Arena catalog and enroll to start your build timer.",
  },
  {
    id: "in_progress",
    label: "In Progress",
    shortLabel: "Build",
    description: "Active feature implementation, test execution, and incremental Git commits.",
    tip: "Maintain a steady commit history and verify test coverage before submitting.",
  },
  {
    id: "submitted",
    label: "Submitted",
    shortLabel: "Submit",
    description: "Pull request link and deployed live demo link dispatched to evaluators.",
    tip: "Solution received! Review automated smoke test outputs while queuing for review.",
  },
  {
    id: "under_review",
    label: "Under Review",
    shortLabel: "Review",
    description: "Automated test suite and mentor code quality evaluation in progress.",
    tip: "Mentors are validating code structure, mobile responsiveness, and clean architecture.",
  },
  {
    id: "completed",
    label: "Completed",
    shortLabel: "Verified",
    description: "Submission verified! XP awarded, leaderboard rank updated, and badge unlocked.",
    tip: "Challenge solved! Showcase your project on GitHub and claim your credential.",
  },
] as const;

type JourneyStageId = (typeof JOURNEY_STAGES)[number]["id"];

// Maps any status string into a journey stage index (0 to 4)
function getStageIndexForStatus(status: string): number {
  const s = status.toLowerCase().replace(/\s+/g, "_");
  if (s === "completed" || s === "approved") return 4;
  if (s === "under_review") return 3;
  if (s === "submitted") return 2;
  if (s === "in_progress" || s === "active") return 1;
  return 0; // not_started or available
}

export default function ProgressPage() {
  const {
    challenges,
    userProfile,
    activeChallengeIds,
    submissions,
    getChallengeStatus,
    getSubmission,
    completeChallenge,
  } = useChallenges();

  const toast = useToast();

  // Hydration state
  const [mounted, setMounted] = useState(false);

  // Selected Badge modal state
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // Tabs for My Challenges: All | In Progress | Submitted | Completed
  const [activeTab, setActiveTab] = useState<"All" | "In Progress" | "Submitted" | "Completed">("All");

  // Selected Current Challenge ID
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("gc-01");

  // Local storage persisted progress percentage map
  const [progressMap, setProgressMap] = useState<Record<string, number>>({
    "gc-01": 65,
    "gc-02": 90,
    "gc-04": 100,
    "gc-07": 100,
    "gc-14": 100,
  });

  // Simulated streak check-in state
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [streakCount, setStreakCount] = useState<number>(userProfile.currentStreak || 6);

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedTab = localStorage.getItem("gitclub_progress_tab");
      if (savedTab && ["All", "In Progress", "Submitted", "Completed"].includes(savedTab)) {
        setActiveTab(savedTab as any);
      }

      const savedSelectedId = localStorage.getItem("gitclub_selected_challenge_id");
      if (savedSelectedId) {
        setSelectedChallengeId(savedSelectedId);
      }

      const savedProgressMap = localStorage.getItem("gitclub_challenge_progress");
      if (savedProgressMap) {
        setProgressMap((prev) => ({
          ...prev,
          ...JSON.parse(savedProgressMap),
        }));
      }

      const savedCheckin = localStorage.getItem("gitclub_streak_checked_in");
      if (savedCheckin === "true") {
        setHasCheckedInToday(true);
      }

      const savedStreak = localStorage.getItem("gitclub_streak_count");
      if (savedStreak) {
        setStreakCount(parseInt(savedStreak, 10));
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }, []);

  // Save tab selection
  const handleTabChange = (tab: "All" | "In Progress" | "Submitted" | "Completed") => {
    setActiveTab(tab);
    try {
      localStorage.setItem("gitclub_progress_tab", tab);
    } catch {}
  };

  // Switch selected current challenge
  const handleSelectCurrentChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    try {
      localStorage.setItem("gitclub_selected_challenge_id", challengeId);
    } catch {}
    toast.info("Active Focus Updated", "Now tracking progress for this challenge.");
  };

  // Update progress percentage
  const handleUpdateProgress = (newVal: number) => {
    const clamped = Math.min(100, Math.max(0, newVal));
    const updated = {
      ...progressMap,
      [selectedChallengeId]: clamped,
    };
    setProgressMap(updated);
    try {
      localStorage.setItem("gitclub_challenge_progress", JSON.stringify(updated));
    } catch {}
    toast.success("Progress Saved", `Challenge implementation marked at ${clamped}%.`);
  };

  // Daily Streak Check-in Action
  const handleDailyCheckIn = () => {
    if (hasCheckedInToday) {
      toast.info("Already Checked In", "You've already claimed your building streak today!");
      return;
    }
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    setHasCheckedInToday(true);
    try {
      localStorage.setItem("gitclub_streak_checked_in", "true");
      localStorage.setItem("gitclub_streak_count", newStreak.toString());
    } catch {}
    toast.xp(50, `Day ${newStreak} Streak Maintained! +50 XP bonus.`);
  };

  // Identify Current Challenge object
  const currentChallenge = useMemo(() => {
    // 1. Try selected ID
    const found = challenges.find((c) => c.id === selectedChallengeId);
    if (found) return found;
    // 2. Try activeChallengeIds from context
    const activeFirst = activeChallengeIds[0];
    const foundActive = challenges.find((c) => c.id === activeFirst);
    if (foundActive) return foundActive;
    // 3. Fallback to first challenge
    return challenges[0];
  }, [challenges, selectedChallengeId, activeChallengeIds]);

  // Current challenge status & submission details
  const currentStatus = currentChallenge ? getChallengeStatus(currentChallenge.id) : "In Progress";
  const currentSubmission = currentChallenge ? getSubmission(currentChallenge.id) : undefined;

  // Active Journey Pipeline Stage Index
  const activeStageIndex = useMemo(() => {
    // If the submission has explicit status
    if (currentSubmission?.status) {
      return getStageIndexForStatus(currentSubmission.status);
    }
    return getStageIndexForStatus(currentStatus);
  }, [currentStatus, currentSubmission]);

  // Current Challenge Progress Percentage
  const currentProgressPercent = useMemo(() => {
    if (currentStatus === "Completed") return 100;
    if (currentSubmission?.status === "Submitted") return 90;
    if (currentSubmission?.status === "Under Review") return 95;
    return progressMap[currentChallenge?.id || "gc-01"] ?? 65;
  }, [currentStatus, currentSubmission, progressMap, currentChallenge]);

  // Started Date for current challenge
  const startedDate = useMemo(() => {
    if (currentSubmission?.submittedAt) {
      // If submitted, started earlier
      return "Sep 15, 2026";
    }
    return "Sep 15, 2026";
  }, [currentSubmission]);

  // Aggregate user challenges with their statuses
  const userChallengesList = useMemo(() => {
    return challenges
      .map((c) => {
        const cStatus = getChallengeStatus(c.id);
        const sub = getSubmission(c.id);
        const isEnrolled =
          activeChallengeIds.includes(c.id) ||
          !!sub ||
          cStatus === "Completed" ||
          cStatus === "In Progress" ||
          cStatus === "Submitted" ||
          cStatus === "Under Review";

        // Determine effective start/submitted date
        const effectiveDate = sub?.submittedAt
          ? formatDate(sub.submittedAt)
          : c.createdAt
          ? formatDate(c.createdAt)
          : "Sep 15, 2026";

        return {
          challenge: c,
          status: cStatus,
          submission: sub,
          isEnrolled,
          effectiveDate,
        };
      })
      .filter((item) => item.isEnrolled);
  }, [challenges, activeChallengeIds, getChallengeStatus, getSubmission]);

  // Filter challenges according to the selected tab: All | In Progress | Submitted | Completed
  const filteredUserChallenges = useMemo(() => {
    if (activeTab === "All") return userChallengesList;
    if (activeTab === "In Progress") {
      return userChallengesList.filter((item) => item.status === "In Progress");
    }
    if (activeTab === "Submitted") {
      return userChallengesList.filter(
        (item) => item.status === "Submitted" || item.status === "Under Review"
      );
    }
    if (activeTab === "Completed") {
      return userChallengesList.filter((item) => item.status === "Completed");
    }
    return userChallengesList;
  }, [userChallengesList, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: userChallengesList.length,
      "In Progress": userChallengesList.filter((item) => item.status === "In Progress").length,
      Submitted: userChallengesList.filter(
        (item) => item.status === "Submitted" || item.status === "Under Review"
      ).length,
      Completed: userChallengesList.filter((item) => item.status === "Completed").length,
    };
  }, [userChallengesList]);

  // Top Stats dynamic counts
  const totalCompletedCount = useMemo(() => {
    const count = userChallengesList.filter((item) => item.status === "Completed").length;
    return Math.max(count, userProfile.challengesCompleted);
  }, [userChallengesList, userProfile.challengesCompleted]);

  const totalInProgressCount = useMemo(() => {
    const count = userChallengesList.filter((item) => item.status === "In Progress").length;
    return Math.max(count, userProfile.inProgressCount);
  }, [userChallengesList, userProfile.inProgressCount]);

  // Level & XP calculations (1000 XP per level)
  const currentLevel = Math.floor(userProfile.totalXp / 1000) + 1;
  const currentLevelBaseXp = (currentLevel - 1) * 1000;
  const nextLevelXp = currentLevel * 1000;
  const levelProgress = Math.min(
    100,
    Math.round(((userProfile.totalXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)
  );

  // Weekly cadence days
  const weeklyCadence = [
    { day: "Mon", code: "M", completed: true },
    { day: "Tue", code: "T", completed: true },
    { day: "Wed", code: "W", completed: true },
    { day: "Thu", code: "T", completed: true },
    { day: "Fri", code: "F", completed: true },
    { day: "Sat", code: "S", completed: true },
    { day: "Sun", code: "S", completed: hasCheckedInToday },
  ];

  return (
    <div className="relative min-h-screen pb-24 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ========================================================================= */}
        {/* PAGE HEADER */}
        {/* ========================================================================= */}
        <div className="relative pb-8 border-b border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Student Challenge Journey</span>
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span className="text-slate-400">{userProfile.department || "CSPIT - IT"}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Participant Progress
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Track your active challenge lifecycle, implementation velocity, verified submissions,
                and earned badges in the Git Club Arena.
              </p>
            </div>

            {/* User Profile Quick Banner */}
            <div className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-[#111726] border border-white/[0.08] shadow-sm shrink-0">
              <Avatar
                src={userProfile.avatar}
                name={userProfile.name}
                size="md"
                status="online"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white leading-tight">
                    {userProfile.name}
                  </span>
                  <Badge variant="outline" size="sm" className="font-mono text-[10px] py-0 px-1.5">
                    Lvl {currentLevel}
                  </Badge>
                </div>
                <span className="text-xs font-mono text-emerald-400 mt-0.5">
                  {userProfile.studentId || "23IT089"} • {userProfile.branch || "Information Technology"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. TOP STATS (Total XP, Completed, In Progress, Current Streak) */}
        {/* ========================================================================= */}
        <section aria-labelledby="top-stats-heading">
          <h2 id="top-stats-heading" className="sr-only">
            Top Overview Stats
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* TOTAL XP CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  <span className="font-semibold text-slate-300">Total XP</span>
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
                  {userProfile.totalXp.toLocaleString()} <span className="text-xs sm:text-sm text-emerald-400 font-mono">XP</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Level {currentLevel}</span>
                  <span className="text-emerald-400 font-semibold">{levelProgress}%</span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={levelProgress} size="sm" variant="emerald" showPercentage={false} />
                </div>
              </CardContent>
            </Card>

            {/* COMPLETED CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  <span className="font-semibold text-slate-300">Completed</span>
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
                  {totalCompletedCount}
                </div>
                <p className="mt-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Verified by reviewers</span>
                </p>
              </CardContent>
            </Card>

            {/* IN PROGRESS CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90 relative overflow-hidden group hover:border-amber-500/30 transition-all">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  <span className="font-semibold text-slate-300">In Progress</span>
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Play className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
                  {totalInProgressCount}
                </div>
                <p className="mt-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Active building workspaces</span>
                </p>
              </CardContent>
            </Card>

            {/* CURRENT STREAK CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90 relative overflow-hidden group hover:border-amber-500/30 transition-all">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-amber-500/15 blur-xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  <span className="font-semibold text-slate-300">Current Streak</span>
                  <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-amber-400 fill-amber-400/40" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-num">
                  {streakCount} <span className="text-xs sm:text-sm text-slate-300 font-mono">Days</span>
                </div>
                <p className="mt-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>1.5x XP Streak multiplier</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CURRENT CHALLENGE */}
        {/* ========================================================================= */}
        {currentChallenge && (
          <section aria-labelledby="current-challenge-heading" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Terminal className="h-4 w-4" />
                </div>
                <h2 id="current-challenge-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Current Challenge
                </h2>
                <Badge variant="warning" size="sm" pulseDot>
                  Active Focus
                </Badge>
              </div>

              {/* Challenge switcher dropdown / helper */}
              {userChallengesList.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    Switch Focus:
                  </span>
                  <div className="relative inline-block text-left">
                    <select
                      aria-label="Switch current active challenge"
                      value={currentChallenge.id}
                      onChange={(e) => handleSelectCurrentChallenge(e.target.value)}
                      className="px-3 py-1.5 bg-[#0b0f17] border border-white/[0.12] rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8"
                    >
                      {userChallengesList.map(({ challenge }) => (
                        <option key={challenge.id} value={challenge.id}>
                          {challenge.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <Card className="border-emerald-500/30 bg-gradient-to-br from-[#131d2e] via-[#101726] to-[#0d131f] p-6 sm:p-8 shadow-xl shadow-emerald-950/20 relative overflow-hidden">
              {/* Vibrant Accent Edge */}
              <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Main Challenge Meta */}
                <div className="space-y-4 max-w-3xl flex-1">
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-slate-200">
                      {getCategoryIcon(currentChallenge.category)}
                      <span>{currentChallenge.category}</span>
                    </span>

                    <DifficultyBadge difficulty={currentChallenge.difficulty} size="sm" />
                    <StatusBadge status={currentStatus} size="sm" />

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 font-bold">
                      <Zap className="h-3 w-3 text-amber-400 fill-amber-400/20" />
                      <span>+{currentChallenge.points} XP</span>
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <div>
                    <Link
                      href={`/challenges/${currentChallenge.slug}`}
                      className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white hover:text-emerald-400 transition-colors inline-block"
                    >
                      {currentChallenge.title}
                    </Link>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {currentChallenge.shortDescription}
                    </p>
                  </div>

                  {/* Dates Row (Started Date & Deadline) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Started Date</span>
                        <span className="font-semibold text-white">{startedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-300">
                      <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase text-slate-400 block">Deadline</span>
                          {getDeadlineCountdown(currentChallenge.deadline) && (
                            <span className="text-[10px] text-amber-300 font-bold">
                              {getDeadlineCountdown(currentChallenge.deadline)}
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-white">
                          {formatDate(currentChallenge.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar Section */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-semibold">Progress Percentage</span>
                        <span className="text-[10px] text-slate-400">
                          ({currentStatus === "Completed" ? "Completed" : "Implementation State"})
                        </span>
                      </div>
                      <span className="text-base font-extrabold text-emerald-400 font-mono-num">
                        {currentProgressPercent}%
                      </span>
                    </div>

                    {/* The Visual Progress Bar */}
                    <ProgressBar
                      value={currentProgressPercent}
                      size="lg"
                      variant="emerald"
                      showPercentage={false}
                    />

                    {/* Interactive Progress Tweaker (Persisted in localStorage) */}
                    {currentStatus !== "Completed" && (
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="h-3 w-3 text-slate-400" />
                          <span>Quick Adjust:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[25, 50, 75, 90, 100].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleUpdateProgress(preset)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                                currentProgressPercent === preset
                                  ? "bg-emerald-500 text-slate-950 font-bold"
                                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]"
                              }`}
                            >
                              {preset}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="flex flex-col gap-3 shrink-0 lg:w-64 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-6 lg:pt-0 lg:pl-8 justify-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Challenge Actions
                  </span>

                  {currentStatus === "Completed" ? (
                    <Link href={`/challenges/${currentChallenge.slug}`} className="w-full">
                      <Button
                        variant="secondary"
                        size="md"
                        leftIcon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                        className="w-full font-mono text-xs"
                      >
                        View Solution
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => completeChallenge(currentChallenge.id)}
                        leftIcon={<Sparkles className="h-4 w-4 text-amber-300" />}
                        className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 cursor-pointer"
                      >
                        Complete Challenge (+500 XP)
                      </Button>
                      <Link href={`/challenges/${currentChallenge.slug}/submit`} className="w-full">
                        <Button
                          variant="secondary"
                          size="md"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                          className="w-full font-mono text-xs"
                        >
                          Submit Solution Form
                        </Button>
                      </Link>
                    </>
                  )}

                  <Link href={`/challenges/${currentChallenge.slug}`} className="w-full">
                    <Button
                      variant="outline"
                      size="md"
                      leftIcon={<Code2 className="h-4 w-4" />}
                      className="w-full font-mono text-xs"
                    >
                      Challenge Brief
                    </Button>
                  </Link>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-slate-400">
                    <span className="text-slate-300 font-semibold block mb-0.5">Need assistance?</span>
                    Check starter templates and requirement guidelines in the repository README.
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. CHALLENGE JOURNEY (5 Stages with Downward Arrows & State Highlight) */}
        {/* ========================================================================= */}
        <section aria-labelledby="challenge-journey-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Layers className="h-4 w-4" />
              </div>
              <h2 id="challenge-journey-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Challenge Journey
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Journey for:</span>
              <span className="font-semibold text-emerald-400">
                {currentChallenge ? currentChallenge.title : "Active Challenge"}
              </span>
            </div>
          </div>

          {/* DESKTOP PIPELINE & MOBILE VERTICAL PIPELINE WITH DOWNWARD ARROWS (↓) */}
          <Card className="border-white/[0.08] bg-[#111726]/90 p-5 sm:p-7">
            {/* 1. Desktop Horizontal Stepper Track */}
            <div className="hidden lg:grid grid-cols-5 gap-3 relative mb-6 pb-6 border-b border-white/[0.06]">
              {JOURNEY_STAGES.map((stage, idx) => {
                const isCurrent = idx === activeStageIndex;
                const isPassed = idx < activeStageIndex;
                const isUpcoming = idx > activeStageIndex;

                return (
                  <div
                    key={stage.id}
                    className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                      isCurrent
                        ? "bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30"
                        : isPassed
                        ? "bg-white/[0.03] border-white/[0.08] text-slate-300"
                        : "bg-white/[0.01] border-white/[0.04] text-slate-500 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold ${
                            isPassed
                              ? "bg-emerald-500 text-slate-950"
                              : isCurrent
                              ? "bg-emerald-400 text-slate-950 ring-2 ring-emerald-400/30"
                              : "bg-white/[0.06] text-slate-500"
                          }`}
                        >
                          {isPassed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                        </span>

                        {isCurrent && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            CURRENT
                          </span>
                        )}
                      </div>

                      <div className={`font-bold text-sm tracking-tight ${isCurrent ? "text-emerald-300" : isPassed ? "text-white" : "text-slate-400"}`}>
                        {stage.label}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 mt-1 line-clamp-2">
                        {stage.description}
                      </div>
                    </div>

                    {/* Connecting Arrow for desktop */}
                    {idx < JOURNEY_STAGES.length - 1 && (
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden xl:flex h-5 w-5 items-center justify-center rounded-full bg-[#111726] border border-white/[0.12] text-slate-400">
                        <span className="text-[10px] font-bold">→</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 2. Structured Flow Representation with explicit downward arrows (↓) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Step-by-Step Lifecycle Sequence
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  Stage {activeStageIndex + 1} of 5 ({JOURNEY_STAGES[activeStageIndex].label})
                </span>
              </div>

              <div className="flex flex-col items-stretch max-w-3xl mx-auto py-2">
                {JOURNEY_STAGES.map((stage, idx) => {
                  const isCurrent = idx === activeStageIndex;
                  const isPassed = idx < activeStageIndex;
                  const isUpcoming = idx > activeStageIndex;

                  return (
                    <React.Fragment key={stage.id}>
                      {/* Stage Card */}
                      <div
                        className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                          isCurrent
                            ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-[#162032] border-emerald-500/50 shadow-xl shadow-emerald-950/40 ring-2 ring-emerald-500/30"
                            : isPassed
                            ? "bg-white/[0.03] border-white/[0.08]"
                            : "bg-white/[0.01] border-white/[0.04] opacity-70"
                        }`}
                      >
                        <div className="flex items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start sm:items-center gap-3.5">
                            {/* Step Indicator */}
                            <div
                              className={`flex h-8 w-8 sm:h-9 sm:m-9 items-center justify-center rounded-xl font-mono text-xs font-bold shrink-0 transition-transform ${
                                isPassed
                                  ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30"
                                  : isCurrent
                                  ? "bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/40 scale-105"
                                  : "bg-white/[0.06] border border-white/[0.08] text-slate-400"
                              }`}
                            >
                              {isPassed ? (
                                <Check className="h-4 w-4 stroke-[3]" />
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>

                            {/* Label & Description */}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`text-base sm:text-lg font-bold tracking-tight ${
                                    isCurrent
                                      ? "text-emerald-300"
                                      : isPassed
                                      ? "text-white"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {stage.label}
                                </h3>

                                {isCurrent && (
                                  <Badge variant="success" size="sm" pulseDot>
                                    Current State
                                  </Badge>
                                )}

                                {isPassed && (
                                  <span className="text-[11px] font-mono text-emerald-400/80 hidden sm:inline">
                                    ✓ Passed
                                  </span>
                                )}
                              </div>

                              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                                {stage.description}
                              </p>
                            </div>
                          </div>

                          {/* Stage Action / Tag */}
                          <div className="shrink-0 text-right">
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-semibold animate-pulse">
                                In Focus
                              </span>
                            ) : isPassed ? (
                              <span className="font-mono text-xs text-slate-400">
                                Completed
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-slate-600">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Highlighted active state tip box */}
                        {isCurrent && (
                          <div className="mt-3.5 pt-3 border-t border-emerald-500/20 flex items-center gap-2 text-xs font-mono text-emerald-200/90">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{stage.tip}</span>
                          </div>
                        )}
                      </div>

                      {/* DOWNWARD ARROW (↓) CONNECTOR (Mandatory from prompt) */}
                      {idx < JOURNEY_STAGES.length - 1 && (
                        <div className="flex flex-col items-center justify-center my-1.5 py-1">
                          <div className="h-2 w-0.5 bg-gradient-to-b from-white/20 to-white/40" />
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                              isPassed
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                : isCurrent
                                ? "bg-emerald-400/20 border-emerald-400/50 text-emerald-300 animate-bounce"
                                : "bg-white/[0.04] border-white/[0.08] text-slate-500"
                            }`}
                          >
                            <span className="text-sm font-bold leading-none">↓</span>
                          </div>
                          <div className="h-2 w-0.5 bg-gradient-to-b from-white/40 to-white/20" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* 4. MY CHALLENGES (Tabs: All | In Progress | Submitted | Completed) */}
        {/* ========================================================================= */}
        <section aria-labelledby="my-challenges-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <FolderGit2 className="h-4 w-4" />
              </div>
              <div>
                <h2 id="my-challenges-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  My Challenges
                </h2>
              </div>
            </div>

            {/* Tabs Row: All, In Progress, Submitted, Completed */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(["All", "In Progress", "Submitted", "Completed"] as const).map((tab) => {
                const isSelected = activeTab === tab;
                const count = tabCounts[tab];

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        isSelected
                          ? "bg-emerald-500/30 text-emerald-200 font-bold"
                          : "bg-white/[0.06] text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Challenges List or Cards */}
          {filteredUserChallenges.length > 0 ? (
            <div className="space-y-4">
              {filteredUserChallenges.map(({ challenge, status, submission, effectiveDate }) => {
                const isCurrentActive = challenge.id === selectedChallengeId;

                return (
                  <Card
                    key={challenge.id}
                    className={`p-5 sm:p-6 border transition-all ${
                      isCurrentActive
                        ? "border-emerald-500/40 bg-gradient-to-r from-[#111a29] via-[#111726] to-[#111726] shadow-md shadow-emerald-950/20"
                        : "border-white/[0.08] bg-[#111726]/90 hover:border-white/[0.16]"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Challenge Details: Challenge, Status, XP, Date */}
                      <div className="space-y-3 max-w-3xl flex-1">
                        {/* Tags: Category, Difficulty, Status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
                            {getCategoryIcon(challenge.category)}
                            <span>{challenge.category}</span>
                          </span>

                          <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                          <StatusBadge status={status} size="sm" />

                          {isCurrentActive && (
                            <Badge variant="warning" size="sm">
                              Focused
                            </Badge>
                          )}
                        </div>

                        {/* Title & Short Description */}
                        <div>
                          <Link
                            href={`/challenges/${challenge.slug}`}
                            className="text-base sm:text-lg font-bold text-white hover:text-emerald-400 transition-colors inline-block"
                          >
                            {challenge.title}
                          </Link>
                          <p className="mt-1 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                            {challenge.shortDescription}
                          </p>
                        </div>

                        {/* Meta: XP and Date */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-slate-400 pt-1">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                            <span>+{challenge.points} XP</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {status === "Completed"
                                ? `Completed ${effectiveDate}`
                                : status === "Submitted" || status === "Under Review"
                                ? `Submitted ${effectiveDate}`
                                : `Started ${effectiveDate}`}
                            </span>
                          </div>

                          {submission?.score && (
                            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                              <Award className="h-3.5 w-3.5" />
                              <span>Score: {submission.score}/100</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                        {/* Switch focus button */}
                        {!isCurrentActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectCurrentChallenge(challenge.id)}
                            className="text-xs font-mono text-slate-400 hover:text-white"
                          >
                            Set Focus
                          </Button>
                        )}

                        {status === "In Progress" ? (
                          <Link href={`/challenges/${challenge.slug}/submit`}>
                            <Button
                              variant="primary"
                              size="sm"
                              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                              className="font-bold text-xs"
                            >
                              Submit Project
                            </Button>
                          </Link>
                        ) : status === "Submitted" || status === "Under Review" ? (
                          <Link href={`/challenges/${challenge.slug}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<FileCheck className="h-3.5 w-3.5 text-cyan-400" />}
                              className="text-xs font-mono"
                            >
                              View Submission
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/challenges/${challenge.slug}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                              className="text-xs font-mono"
                            >
                              Review Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FolderGit2}
              title={`No challenges in "${activeTab}"`}
              description="Explore the arena catalog to enroll in upcoming challenges across Web, AI, IoT, and Security tracks."
              action={{
                label: "Explore Arena",
                onClick: () => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/challenges";
                  }
                },
                icon: <ArrowRight className="h-4 w-4" />,
              }}
            />
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. BADGES & 6. STREAK (Two-Column Section) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* BADGES DISPLAY (8 cols) */}
          <section aria-labelledby="badges-heading" className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Award className="h-4 w-4" />
                </div>
                <h2 id="badges-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Earned Badges
                </h2>
                <Badge variant="success" size="sm">
                  {userProfile.badges.length} Unlocked
                </Badge>
              </div>

              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                Verified on CHARUSAT Developer Profile
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {userProfile.badges.map((badge) => (
                <Card
                  key={badge.id}
                  onClick={() => {
                    setSelectedBadge(badge);
                    setIsBadgeModalOpen(true);
                  }}
                  className="p-5 border-white/[0.08] bg-[#111726]/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:scale-105 transition-transform text-2xl">
                        {badge.emoji || renderBadgeIcon(badge.icon)}
                      </div>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {badge.category}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {badge.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {badge.unlockedAt && (
                    <div className="pt-3 mt-3 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Unlocked {formatDate(badge.unlockedAt)}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* STREAK SECTION (4 cols) */}
          <section aria-labelledby="streak-heading" className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Flame className="h-4 w-4 fill-amber-400/40" />
              </div>
              <h2 id="streak-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Current Streak
              </h2>
            </div>

            <Card className="p-6 border-white/[0.08] bg-[#111726]/90 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Continuous Velocity
                  </span>
                  <div className="text-3xl font-extrabold text-amber-400 font-mono-num mt-0.5">
                    {streakCount} Days
                  </div>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                  <Flame className="h-7 w-7 fill-amber-400/40 text-amber-400 animate-pulse" />
                </div>
              </div>

              {/* Weekly Cadence Checkpoints */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>This Week's Building Cadence</span>
                  <span className="text-amber-400 font-bold">{hasCheckedInToday ? "7/7 Active" : "6/7 Active"}</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {weeklyCadence.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500">{item.code}</span>
                      <div
                        className={`h-8 w-full rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                          item.completed
                            ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10"
                            : "bg-white/[0.02] border border-white/[0.06] text-slate-600"
                        }`}
                      >
                        {item.completed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : "·"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Check-in button (persisted in localStorage) */}
              <div className="pt-2">
                <Button
                  variant={hasCheckedInToday ? "secondary" : "primary"}
                  size="sm"
                  onClick={handleDailyCheckIn}
                  leftIcon={<Flame className="h-4 w-4" />}
                  className="w-full text-xs font-mono font-bold"
                >
                  {hasCheckedInToday ? "Streak Claimed Today ✓" : "Log Today's Check-in (+50 XP)"}
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-slate-400 space-y-1">
                <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Streak Multiplier Active</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Earn 1.5x bonus XP multipliers across all code evaluations while your daily streak remains unbroken.
                </p>
              </div>
            </Card>
          </section>
        </div>

        {/* Badge Details & GitHub Markdown Share Modal */}
        <BadgeDetailModal
          badge={selectedBadge}
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
          isUnlocked={true}
        />
      </div>
    </div>
  );
}
