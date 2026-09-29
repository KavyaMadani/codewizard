"use client";

import React, { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { useChallenges } from "@/context/ChallengeContext";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  DifficultyBadge,
  StatusBadge,
  ProgressBar,
  EmptyState,
  useToast,
} from "@/components/ui";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Flame,
  FolderGit2,
  Globe,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  Zap,
  CheckSquare,
  Square,
  AlertCircle,
  FileCode,
  Brain,
  Smartphone,
  Palette,
  Shield,
  Radio,
  FileCheck,
  HelpCircle,
} from "lucide-react";
import { Github } from "@/components/icons/Github";
import confetti from "canvas-confetti";
import { ChallengeCategory } from "@/types";

// Helper to get category icons
function getCategoryIcon(category: ChallengeCategory) {
  switch (category) {
    case "Web Development":
      return <FolderGit2 className="h-4 w-4" />;
    case "AI / ML":
      return <Brain className="h-4 w-4" />;
    case "App Development":
      return <Smartphone className="h-4 w-4" />;
    case "UI/UX":
      return <Palette className="h-4 w-4" />;
    case "Cybersecurity":
      return <Shield className="h-4 w-4" />;
    case "IoT":
      return <Radio className="h-4 w-4" />;
    default:
      return <Code2 className="h-4 w-4" />;
  }
}

// Helper for formatted deadline
function formatDeadline(deadlineStr: string) {
  try {
    const date = new Date(deadlineStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return deadlineStr;
  }
}

// Helper for relative days remaining
function getDaysRemaining(deadlineStr: string): { text: string; isUrgent: boolean } {
  try {
    const diffTime = new Date(deadlineStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Submission closed", isUrgent: false };
    if (diffDays === 0) return { text: "Due today (23:59)", isUrgent: true };
    if (diffDays === 1) return { text: "1 day remaining", isUrgent: true };
    if (diffDays <= 7) return { text: `${diffDays} days remaining`, isUrgent: true };
    return { text: `${diffDays} days remaining`, isUrgent: false };
  } catch {
    return { text: "Active", isUrgent: false };
  }
}

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;

  const {
    challenges,
    getChallengeStatus,
    getSubmission,
    startChallenge,
    submitProject,
  } = useChallenges();
  const toast = useToast();

  // Find challenge matching either slug or id
  const challenge = useMemo(() => {
    return challenges.find(
      (c) =>
        c.slug === slug ||
        c.id === slug ||
        c.slug?.toLowerCase() === slug.toLowerCase() ||
        c.id.toLowerCase() === slug.toLowerCase()
    );
  }, [challenges, slug]);

  // Local interactive states
  const [isSaved, setIsSaved] = useState(false);
  const [checkedRequirements, setCheckedRequirements] = useState<Record<number, boolean>>({});
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load bookmark & checklist state from localStorage
  useEffect(() => {
    if (!challenge) return;
    try {
      const savedKey = `gitclub_saved_${challenge.id}`;
      const checklistKey = `gitclub_checklist_${challenge.id}`;

      const savedVal = localStorage.getItem(savedKey);
      if (savedVal) setIsSaved(JSON.parse(savedVal));

      const checklistVal = localStorage.getItem(checklistKey);
      if (checklistVal) {
        setCheckedRequirements(JSON.parse(checklistVal));
      } else {
        // Default initial items
        setCheckedRequirements({ 0: true });
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [challenge]);

  // Toggle bookmark
  const handleToggleSave = () => {
    if (!challenge) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      localStorage.setItem(`gitclub_saved_${challenge.id}`, JSON.stringify(nextSaved));
    } catch {
      // Ignore
    }

    if (nextSaved) {
      toast.success(
        "Challenge Saved",
        `"${challenge.title}" was added to your bookmarked challenges.`
      );
    } else {
      toast.info("Bookmark Removed", "Challenge removed from saved list.");
    }
  };

  // Toggle requirement checklist item
  const handleToggleRequirement = (index: number) => {
    if (!challenge) return;
    const nextState = {
      ...checkedRequirements,
      [index]: !checkedRequirements[index],
    };
    setCheckedRequirements(nextState);
    try {
      localStorage.setItem(`gitclub_checklist_${challenge.id}`, JSON.stringify(nextState));
    } catch {
      // Ignore
    }
  };

  // Share challenge link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Link Copied", "Challenge URL copied to clipboard!");
    }
  };

  // Status & submission helpers
  const status = challenge ? getChallengeStatus(challenge.id) : "Active";
  const submission = challenge ? getSubmission(challenge.id) : undefined;
  const isCompleted = status === "Completed";
  const isInProgress = status === "In Progress";
  const deadlineInfo = challenge ? getDaysRemaining(challenge.deadline) : { text: "", isUrgent: false };

  // Calculate checklist progress percentage
  const totalRequirements = challenge?.requirements.length || 1;
  const completedRequirementsCount = Object.values(checkedRequirements).filter(Boolean).length;
  const progressPercentage = Math.round(
    (Math.min(completedRequirementsCount, totalRequirements) / totalRequirements) * 100
  );

  // Handle Start Challenge Action
  const handleStartChallenge = () => {
    if (!challenge) return;
    startChallenge(challenge.id);
    toast.success(
      "Challenge Started! 🚀",
      `You're now enrolled in "${challenge.title}". Code your solution and submit before the deadline.`
    );

    // Scroll to workspace on action
    setTimeout(() => {
      document.getElementById("submission-workspace")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle Submit Project Form
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (!githubUrl.trim()) {
      toast.error("GitHub URL Required", "Please provide a valid GitHub repository URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitProject(challenge.id, {
        githubUrl: githubUrl.trim(),
        liveDemoUrl: demoUrl.trim() || undefined,
        projectName: projectName.trim() || challenge.title,
        description:
          description.trim() || "Completed requirements using modern component architecture.",
      });

      // Trigger celebratory confetti animation
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#06b6d4", "#f59e0b", "#a855f7", "#ffffff"],
      });

      toast.xp(
        challenge.points,
        `Project submitted successfully! +${challenge.points} XP added to your student ranking.`
      );

      // Scroll to review
      setTimeout(() => {
        document.getElementById("submission-workspace")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      toast.error("Submission Error", "Failed to record your submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll to workspace on "Continue Challenge"
  const handleScrollToWorkspace = () => {
    document.getElementById("submission-workspace")?.scrollIntoView({ behavior: "smooth" });
  };

  // If Challenge Not Found (Invalid Slug)
  if (!challenge) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <EmptyState
            icon={AlertCircle}
            title="Challenge Not Found"
            description={`We couldn't locate any active challenge matching "${slug}". It might have expired or been renamed.`}
            action={{
              label: "Explore All Challenges",
              onClick: () => {
                if (typeof window !== "undefined") {
                  window.location.href = "/challenges";
                }
              },
              icon: <ArrowLeft className="h-4 w-4" />,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-28 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* 1. BACK NAVIGATION & BREADCRUMB */}
        {/* ========================================================================= */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Challenges</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white hover:border-white/[0.18] transition-colors cursor-pointer"
              title="Share challenge"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                isSaved
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  : "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.18]"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Save Challenge</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP HERO HEADER SECTION */}
        {/* ========================================================================= */}
        <div className="relative rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#121829] via-[#0f1523] to-[#0b0f1a] p-6 sm:p-8 lg:p-10 mb-8 shadow-2xl overflow-hidden">
          {/* Subtle atmospheric glow */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                  {getCategoryIcon(challenge.category)}
                  <span>{challenge.category}</span>
                </span>

                <DifficultyBadge difficulty={challenge.difficulty} size="md" />

                {status !== "Active" ? (
                  <StatusBadge status={status} size="md" />
                ) : (
                  <StatusBadge status={challenge.status} size="md" />
                )}

                {challenge.featured && (
                  <Badge variant="warning" size="sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured Spotlight
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {challenge.title}
              </h1>

              {/* Short Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {challenge.shortDescription}
              </p>

              {/* Key Metrics Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-mono text-slate-300">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                  <span className="font-bold text-emerald-400 font-mono-num">
                    +{challenge.points} XP
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Clock className={`h-4 w-4 ${deadlineInfo.isUrgent ? "text-amber-400" : "text-slate-400"}`} />
                  <span className={deadlineInfo.isUrgent ? "text-amber-300 font-medium" : "text-slate-300"}>
                    {deadlineInfo.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <span className="text-slate-300">
                    <strong className="text-white font-mono-num">{challenge.participants}</strong> joined
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Flame className="h-4 w-4 text-rose-400" />
                  <span className="text-slate-300">Est. {challenge.duration}</span>
                </div>
              </div>
            </div>

            {/* Desktop Hero Action Box */}
            <div className="lg:w-72 shrink-0 flex flex-col gap-3.5 p-5 rounded-xl bg-[#090d16]/80 border border-white/[0.1] backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-white/[0.08]">
                <span>Enrollment Status</span>
                <span
                  className={`font-semibold ${
                    isCompleted
                      ? "text-emerald-400"
                      : isInProgress
                      ? "text-amber-400"
                      : "text-slate-300"
                  }`}
                >
                  {isCompleted ? "Completed ✓" : isInProgress ? "In Progress" : "Available"}
                </span>
              </div>

              {/* Primary CTA Button */}
              {isCompleted ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleScrollToWorkspace}
                  leftIcon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  className="w-full font-semibold border-emerald-500/40 text-emerald-300"
                >
                  View Submission
                </Button>
              ) : isInProgress ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleScrollToWorkspace}
                  leftIcon={<Play className="h-4 w-4 fill-slate-950" />}
                  className="w-full font-bold shadow-lg shadow-emerald-500/20"
                >
                  Continue Challenge
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartChallenge}
                  leftIcon={<Zap className="h-4 w-4 fill-slate-950" />}
                  className="w-full font-bold shadow-lg shadow-emerald-500/20"
                >
                  Start Challenge
                </Button>
              )}

              {/* Secondary Save Action */}
              <Button
                variant="secondary"
                size="md"
                onClick={handleToggleSave}
                leftIcon={
                  isSaved ? (
                    <BookmarkCheck className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-slate-400" />
                  )
                }
                className="w-full text-xs font-mono"
              >
                {isSaved ? "Saved in Bookmarks" : "Save for Later"}
              </Button>

              <div className="text-[11px] font-mono text-center text-slate-400 pt-1">
                Zero backend setup required • Instant validation
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN CONTENT LAYOUT (2 COLUMNS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Deep dive specs & Problem statement (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* OVERVIEW & PROBLEM STATEMENT */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Challenge Brief</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  Overview & Problem Statement
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Understand the core user problem and engineering objectives before writing code.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 text-sm text-slate-200 leading-relaxed">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    The Problem
                  </h4>
                  <p className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] text-slate-300">
                    {challenge.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    What You Must Build
                  </h4>
                  <div className="bg-emerald-500/[0.04] p-4 rounded-xl border border-emerald-500/20 text-emerald-100/90 space-y-2">
                    <p>
                      Construct a functional solution that addresses all user flows outlined in the requirements checklist. Your solution should prioritize fast response times, accessible interactive components, and clean modular code architecture.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* REQUIREMENTS CHECKLIST */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Specifications</span>
                    </div>
                    <CardTitle className="text-xl font-bold text-white">
                      Requirements Checklist
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      {completedRequirementsCount}/{challenge.requirements.length}
                    </span>
                    <span className="text-slate-400">completed</span>
                  </div>
                </div>
                <CardDescription className="text-slate-400">
                  Tick off items as you implement features in your local workspace.
                </CardDescription>

                {/* Progress bar */}
                <div className="mt-2">
                  <ProgressBar
                    value={progressPercentage}
                    size="sm"
                    variant="emerald"
                    showPercentage={false}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {challenge.requirements.map((req, index) => {
                    const isChecked = !!checkedRequirements[index];

                    return (
                      <div
                        key={index}
                        onClick={() => handleToggleRequirement(index)}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                            : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:border-white/[0.14] hover:bg-white/[0.04]"
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 shrink-0 text-emerald-400 transition-transform active:scale-90"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-5 w-5 fill-emerald-500/20 text-emerald-400" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-500" />
                          )}
                        </button>

                        <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                          <span className={isChecked ? "line-through text-slate-400" : "text-slate-200"}>
                            {req}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* RULES & CONSTRAINTS */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Submission Guidelines</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  Rules & Constraints
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Adhere to these developer standards for full XP points and leaderboard accreditation.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ol className="space-y-3">
                  {challenge.rules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs sm:text-sm text-slate-300"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono font-bold text-emerald-400">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* DELIVERABLES */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-1">
                  <FolderGit2 className="h-3.5 w-3.5" />
                  <span>Proof of Work</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  Required Deliverables
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Every submission must contain valid links matching these outputs.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {challenge.deliverables.map((deliv, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {deliv}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ========================================================================= */}
            {/* 4. PROGRESS & SUBMISSION WORKSPACE */}
            {/* ========================================================================= */}
            <div id="submission-workspace" className="pt-4 scroll-mt-20">
              <Card
                className={`border transition-all duration-300 ${
                  isCompleted
                    ? "border-emerald-500/40 bg-gradient-to-b from-[#111e29] to-[#0f1523]"
                    : isInProgress
                    ? "border-emerald-500/40 bg-gradient-to-b from-[#131b2c] to-[#0f1422] ring-1 ring-emerald-500/20"
                    : "border-white/[0.1] bg-[#111726]/80"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                      <Trophy className="h-3.5 w-3.5" />
                      <span>Project Submission Workspace</span>
                    </div>

                    {isCompleted ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed & Verified
                      </Badge>
                    ) : isInProgress ? (
                      <Badge variant="warning" size="sm" pulseDot>
                        In Progress
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Not Enrolled
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                    {isCompleted
                      ? "Your Submitted Solution"
                      : isInProgress
                      ? "Submit Your Project"
                      : "Ready to Start Building?"}
                  </CardTitle>

                  <CardDescription className="text-slate-400">
                    {isCompleted
                      ? "Review your verified project submission details and scoring results below."
                      : isInProgress
                      ? "Provide your public repository and live demo URL to earn your XP badge."
                      : "Enroll in this challenge to unlock the submission form and start coding."}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {isCompleted && submission ? (
                    /* COMPLETED SUBMISSION VIEW */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            XP Awarded
                          </span>
                          <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-emerald-400 font-mono-num">
                            <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                            <span>+{challenge.points} XP</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            Review Score
                          </span>
                          <div className="mt-1 text-lg font-bold text-white font-mono-num">
                            {submission.score || 95}/100
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            Submitted
                          </span>
                          <div className="mt-1 text-xs font-mono text-slate-300">
                            {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Project Details
                        </div>
                        <div className="text-base font-semibold text-white">
                          {submission.projectName}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {submission.description}
                        </p>

                        <div className="pt-2 flex flex-wrap gap-3">
                          {submission.githubUrl && (
                            <a
                              href={submission.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-slate-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                            >
                              <Github className="h-3.5 w-3.5" />
                              <span>GitHub Repo</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          {submission.demoUrl && (
                            <a
                              href={submission.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span>Live Preview</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {submission.reviewerFeedback && (
                        <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/25">
                          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Automated CI & Peer Feedback</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {submission.reviewerFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : isInProgress ? (
                    /* IN PROGRESS SUBMISSION FORM */
                    <form onSubmit={handleSubmitProject} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5">
                          GitHub Repository URL <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative flex items-center">
                          <Github className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                          <input
                            type="url"
                            required
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/username/my-project"
                            className="w-full h-11 pl-10 pr-4 bg-[#0c121e] border border-white/[0.1] rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono text-slate-300 mb-1.5">
                            Live Demo URL <span className="text-slate-500">(Optional)</span>
                          </label>
                          <div className="relative flex items-center">
                            <Globe className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                              type="url"
                              value={demoUrl}
                              onChange={(e) => setDemoUrl(e.target.value)}
                              placeholder="https://my-project.vercel.app"
                              className="w-full h-11 pl-10 pr-4 bg-[#0c121e] border border-white/[0.1] rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-slate-300 mb-1.5">
                            Project Title <span className="text-slate-500">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder={challenge.title}
                            className="w-full h-11 px-4 bg-[#0c121e] border border-white/[0.1] rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5">
                          Implementation Notes & Architecture <span className="text-slate-500">(Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Briefly mention key tech choices, performance optimizations, or standout features..."
                          className="w-full p-3 bg-[#0c121e] border border-white/[0.1] rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60"
                        />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs font-mono text-slate-400">
                          {progressPercentage < 100 ? (
                            <span>
                              Tip: {completedRequirementsCount} of {challenge.requirements.length} checklist items marked done
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">
                              All {challenge.requirements.length} requirements checked! Ready to submit.
                            </span>
                          )}
                        </span>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          <Link href={`/challenges/${challenge.slug}/submit`} className="w-full sm:w-auto">
                            <Button
                              type="button"
                              variant="outline"
                              size="md"
                              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                              className="w-full sm:w-auto text-xs font-mono"
                            >
                              Full Form & Screenshot
                            </Button>
                          </Link>

                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSubmitting}
                            leftIcon={<Send className="h-4 w-4" />}
                            className="w-full sm:w-auto font-bold px-6"
                          >
                            Quick Submit
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* NOT STARTED PROMPT */
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Play className="h-6 w-6 ml-0.5 fill-emerald-500/30" />
                      </div>
                      <div className="max-w-md">
                        <h4 className="text-base font-bold text-white mb-1">
                          Click "Start Challenge" to Enroll
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                          Enrolling adds this project to your active workspace dashboard and unlocks project submission.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleStartChallenge}
                        leftIcon={<Zap className="h-4 w-4 fill-slate-950" />}
                        className="font-bold px-6 shadow-md shadow-emerald-500/20"
                      >
                        Start Challenge Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Stats, Tech Stack, Timeline (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* TECH STACK CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Technologies</span>
                </div>
                <CardTitle className="text-base font-bold text-white">
                  Recommended Tech Stack
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {challenge.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 hover:border-emerald-500/40 transition-colors"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* DEADLINE & TIMELINE CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Timeline</span>
                </div>
                <CardTitle className="text-base font-bold text-white">
                  Submission Deadline
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Target Date
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {formatDeadline(challenge.deadline)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-300 px-1">
                  <span className="text-slate-400">Estimated Duration:</span>
                  <span className="font-semibold text-white">{challenge.duration}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-300 px-1">
                  <span className="text-slate-400">Time Status:</span>
                  <span
                    className={`font-semibold ${
                      deadlineInfo.isUrgent ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {deadlineInfo.text}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* PARTICIPANTS & COMMUNITY CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>Community</span>
                </div>
                <CardTitle className="text-base font-bold text-white">
                  Active Builders
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <div className="text-2xl font-extrabold text-white font-mono-num">
                      {challenge.participants}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Students Enrolled
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-emerald-400 font-mono-num">
                      {challenge.completionRate}%
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Completion Rate
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  Join fellow developers across CSPIT and DEPSTAR building and submitting solutions for this challenge.
                </div>
              </CardContent>
            </Card>

            {/* QUICK HELP CARD */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Need Assistance?</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-slate-300 space-y-2">
                <p>
                  Have questions regarding requirements or technical setup? Reach out on the CHARUSAT Git Club Discord or discuss with peer mentors in Lab 301.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono text-xs pt-1"
                >
                  <span>View your active dashboard →</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. STICKY MOBILE ACTION BAR */}
        {/* ========================================================================= */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#090d16]/95 border-t border-white/[0.1] backdrop-blur-lg shadow-2xl flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              XP Reward
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono-num">
              +{challenge.points} XP
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSave}
              className="p-2.5"
              title={isSaved ? "Saved" : "Save challenge"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-amber-400" />
              ) : (
                <Bookmark className="h-4 w-4 text-slate-300" />
              )}
            </Button>

            {isCompleted ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleScrollToWorkspace}
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                className="font-bold"
              >
                View Submission
              </Button>
            ) : isInProgress ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleScrollToWorkspace}
                leftIcon={<Play className="h-4 w-4" />}
                className="font-bold"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartChallenge}
                leftIcon={<Zap className="h-4 w-4" />}
                className="font-bold"
              >
                Start Challenge
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
