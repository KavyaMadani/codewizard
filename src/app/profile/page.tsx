"use client";

import React, { useState, useMemo } from "react";
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
  Modal,
  useToast,
} from "@/components/ui";
import {
  User,
  Edit3,
  Calendar,
  Award,
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Brain,
  Palette,
  Shield,
  Smartphone,
  Radio,
  Sparkles,
  Clock,
  ArrowRight,
  Check,
  Layers,
  FileCheck,
  BookOpen,
  Code2,
  Target,
  ShieldAlert,
  Lock,
  Cpu,
} from "lucide-react";
import { Github } from "@/components/icons/Github";
import { ChallengeCategory, Badge as BadgeType } from "@/types";
import { AchievementCard, BadgeDetailModal } from "@/components/gamification";
import { SAMPLE_BADGES } from "@/data/badges";

// Helper to get category icons
function getCategoryIcon(category: ChallengeCategory | string) {
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

// Helper to map badge icons dynamically
function renderBadgeIcon(iconName: string, className = "h-5 w-5") {
  switch (iconName) {
    case "Target":
      return <Target className={`${className} text-emerald-400`} />;
    case "ShieldAlert":
      return <ShieldAlert className={`${className} text-rose-400`} />;
    case "Flame":
      return <Flame className={`${className} text-amber-400 fill-amber-400/20`} />;
    case "Award":
      return <Award className={`${className} text-cyan-400`} />;
    case "Trophy":
      return <Trophy className={`${className} text-amber-300`} />;
    case "Code2":
      return <Code2 className={`${className} text-indigo-400`} />;
    case "Sparkles":
      return <Sparkles className={`${className} text-purple-400`} />;
    case "Lock":
      return <Lock className={`${className} text-rose-400`} />;
    case "Cpu":
      return <Cpu className={`${className} text-teal-400`} />;
    case "Zap":
      return <Zap className={`${className} text-amber-400 fill-amber-400/20`} />;
    default:
      return <Award className={`${className} text-emerald-400`} />;
  }
}

// Format date into human-readable format
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

// Preset avatars for quick customization
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
];

// Branch options
const BRANCH_OPTIONS = [
  "Information Technology (CSPIT)",
  "Computer Engineering (CSPIT)",
  "Computer Science & Engineering (DEPSTAR)",
  "Information Technology (DEPSTAR)",
  "AI & Data Science (CSPIT)",
];

// Year options
const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

export default function ProfilePage() {
  const { userProfile, submissions, challenges, updateUserProfile, completeChallenge } = useChallenges();
  const toast = useToast();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: userProfile.name,
    username: userProfile.username,
    branch: userProfile.branch,
    year: userProfile.year,
    bio:
      userProfile.bio ||
      "3rd-year IT student at CSPIT passionate about frontend engineering, distributed systems, and open-source campus initiatives. Building with TypeScript & Next.js.",
    avatar: userProfile.avatar,
  });

  // Level computation (1,000 XP per level)
  const currentLevel = Math.floor(userProfile.totalXp / 1000) + 1;
  const currentLevelBaseXp = (currentLevel - 1) * 1000;
  const nextLevelXp = currentLevel * 1000;
  const levelProgress = Math.min(
    100,
    Math.round(((userProfile.totalXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100)
  );

  // Sync form when opening edit modal
  const handleOpenEditModal = () => {
    setFormData({
      name: userProfile.name,
      username: userProfile.username,
      branch: userProfile.branch,
      year: userProfile.year,
      bio:
        userProfile.bio ||
        "3rd-year IT student at CSPIT passionate about frontend engineering, distributed systems, and open-source campus initiatives. Building with TypeScript & Next.js.",
      avatar: userProfile.avatar,
    });
    setIsEditModalOpen(true);
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim()) {
      toast.error("Validation Error", "Name and username cannot be blank.");
      return;
    }

    updateUserProfile({
      name: formData.name.trim(),
      username: formData.username.trim().replace(/^@/, ""),
      branch: formData.branch,
      year: formData.year as any,
      bio: formData.bio.trim(),
      avatar: formData.avatar,
    });

    setIsEditModalOpen(false);
    toast.success("Profile Updated", "Your changes have been saved locally.");
  };

  // Aggregate user submissions
  const userSubmissionsList = useMemo(() => {
    const list = Object.values(submissions).filter(
      (sub) => sub.participantId === userProfile.id
    );

    return list
      .map((sub) => {
        const challenge = challenges.find((c) => c.id === sub.challengeId);
        return {
          ...sub,
          challenge,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
  }, [submissions, userProfile.id, challenges]);

  // Completed challenges history
  const completedChallenges = useMemo(() => {
    return userSubmissionsList.filter((s) => s.status === "Completed");
  }, [userSubmissionsList]);

  // Category-based progress calculations
  const categoryProgressData = useMemo(() => {
    // Categories to track
    const tracks: {
      category: ChallengeCategory;
      variant: "emerald" | "cyan" | "indigo" | "amber";
      percentage: number;
      solved: number;
      total: number;
      xp: number;
    }[] = [
      {
        category: "Web Development",
        variant: "emerald",
        percentage: 80,
        solved: 4,
        total: 5,
        xp: 1250,
      },
      {
        category: "AI / ML",
        variant: "cyan",
        percentage: 60,
        solved: 2,
        total: 3,
        xp: 650,
      },
      {
        category: "UI/UX",
        variant: "indigo",
        percentage: 40,
        solved: 1,
        total: 2,
        xp: 500,
      },
      {
        category: "Cybersecurity",
        variant: "amber",
        percentage: 25,
        solved: 1,
        total: 2,
        xp: 300,
      },
    ];

    return tracks;
  }, []);

  return (
    <div className="relative min-h-screen pb-24 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ========================================================================= */}
        {/* 1. PROFILE HEADER SECTION */}
        {/* ========================================================================= */}
        <section aria-labelledby="profile-header-heading">
          <Card className="border-white/[0.08] bg-gradient-to-br from-[#131d2e] via-[#101726] to-[#0d131f] p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-black/20">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              {/* Left Identity: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
                {/* Avatar with edit picture overlay */}
                <div className="relative group shrink-0">
                  <div className="p-1 rounded-3xl bg-gradient-to-tr from-emerald-500/40 via-teal-400/20 to-indigo-500/40 ring-2 ring-emerald-500/30">
                    <Avatar
                      src={userProfile.avatar}
                      name={userProfile.name}
                      size="xl"
                      status="online"
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    title="Change Avatar"
                    className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#111726] border border-white/[0.15] text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all shadow-md cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>

                {/* Identity Information */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1
                      id="profile-header-heading"
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
                    >
                      {userProfile.name}
                    </h1>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      @{userProfile.username}
                    </span>
                    <Badge variant="outline" size="sm" className="font-mono text-[11px]">
                      Level {currentLevel}
                    </Badge>
                  </div>

                  {/* Branch, Faculty, Year, Student ID */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400">
                    <span className="text-slate-300 font-semibold">{userProfile.branch}</span>
                    <span>•</span>
                    <span>{userProfile.year}</span>
                    {userProfile.studentId && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{userProfile.studentId}</span>
                      </>
                    )}
                  </div>

                  {/* Short Bio */}
                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed pt-1">
                    {userProfile.bio ||
                      "3rd-year IT student at CSPIT passionate about frontend engineering, distributed systems, and open-source campus initiatives. Building with TypeScript & Next.js."}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => completeChallenge("gc-01")}
                  leftIcon={<Sparkles className="h-4 w-4 text-emerald-400" />}
                  className="font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer bg-emerald-600 hover:bg-emerald-500"
                >
                  Complete Challenge (+500 XP)
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleOpenEditModal}
                  leftIcon={<Edit3 className="h-4 w-4" />}
                  className="font-mono text-xs cursor-pointer"
                >
                  Edit Profile
                </Button>
                <Link href="/progress">
                  <Button variant="outline" size="md" className="font-mono text-xs">
                    Progress
                  </Button>
                </Link>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STATS ROW (XP, Rank, Completed Challenges, Current Streak) */}
            {/* ========================================================================= */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* STAT 1: TOTAL XP */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <span>Total XP</span>
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
                  {userProfile.totalXp.toLocaleString()} <span className="text-xs text-emerald-400">XP</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Lvl {currentLevel}</span>
                  <span className="text-emerald-400">{levelProgress}%</span>
                </div>
                <div className="pt-1">
                  <ProgressBar value={levelProgress} size="sm" variant="emerald" showPercentage={false} />
                </div>
              </div>

              {/* STAT 2: RANK */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <span>Leaderboard Rank</span>
                  <Trophy className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num flex items-center gap-1.5">
                  <span className="text-indigo-400">#{userProfile.rank}</span>
                  <span className="text-xs text-slate-400 font-normal">Campus Wide</span>
                </div>
                <p className="pt-2 text-[11px] font-mono text-slate-400">
                  Top 25% of CSPIT builders
                </p>
              </div>

              {/* STAT 3: COMPLETED CHALLENGES */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <span>Completed</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
                  {userProfile.challengesCompleted}
                </div>
                <p className="pt-2 text-[11px] font-mono text-slate-400">
                  Verified challenge repositories
                </p>
              </div>

              {/* STAT 4: CURRENT STREAK */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <span>Current Streak</span>
                  <Flame className="h-4 w-4 text-amber-400 fill-amber-400/40" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-num">
                  {userProfile.streak} <span className="text-xs text-slate-300 font-mono">Days</span>
                </div>
                <p className="pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>1.5x XP Streak multiplier</span>
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* 2. PROGRESS (Category-based Progress) */}
        {/* ========================================================================= */}
        <section aria-labelledby="category-progress-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Layers className="h-4 w-4" />
              </div>
              <h2
                id="category-progress-heading"
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                Track & Category Progress
              </h2>
            </div>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Skill mastery across engineering tracks
            </span>
          </div>

          <Card className="border-white/[0.08] bg-[#111726]/90 p-6 sm:p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryProgressData.map((item) => (
                <div
                  key={item.category}
                  className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3 hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-emerald-400">
                        {getCategoryIcon(item.category)}
                      </div>
                      <span className="font-bold text-white text-sm sm:text-base">
                        {item.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono-num">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <ProgressBar
                    value={item.percentage}
                    size="md"
                    variant={item.variant}
                    showPercentage={false}
                  />

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                    <span>
                      {item.solved} of {item.total} challenges completed
                    </span>
                    <span className="text-emerald-300 font-semibold">+{item.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* 3. BADGES (Display Earned Badges) */}
        {/* ========================================================================= */}
        <section aria-labelledby="earned-badges-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <h2
                id="earned-badges-heading"
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                Earned Badges
              </h2>
              <Badge variant="success" size="sm">
                {userProfile.badges.length} Unlocked
              </Badge>
            </div>

            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Verified credentials for GitHub READMEs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_BADGES.map((badge) => {
              const isUnlocked = userProfile.badges.some((b) => b.id === badge.id);
              const userBadge = userProfile.badges.find((b) => b.id === badge.id);
              const displayBadge = userBadge || badge;

              return (
                <AchievementCard
                  key={badge.id}
                  badge={displayBadge}
                  isUnlocked={isUnlocked}
                  onClick={() => {
                    setSelectedBadge(displayBadge);
                    setIsBadgeModalOpen(true);
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. CHALLENGE HISTORY (Completed Challenges) */}
        {/* ========================================================================= */}
        <section aria-labelledby="challenge-history-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h2
                id="challenge-history-heading"
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                Challenge History
              </h2>
              <span className="text-xs font-mono text-slate-400">
                ({completedChallenges.length} Verified Solutions)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {completedChallenges.map((item) => (
              <Card
                key={item.id}
                className="p-5 sm:p-6 border-white/[0.08] bg-[#111726]/90 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Challenge Info */}
                  <div className="space-y-3 max-w-3xl flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.challenge && (
                        <>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
                            {getCategoryIcon(item.challenge.category)}
                            <span>{item.challenge.category}</span>
                          </span>
                          <DifficultyBadge difficulty={item.challenge.difficulty} size="sm" />
                        </>
                      )}
                      <StatusBadge status="Completed" size="sm" />
                      {item.score && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 font-bold">
                          Score: {item.score}/100
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">{item.projectName}</h3>
                      {item.challenge && (
                        <Link
                          href={`/challenges/${item.challenge.slug}`}
                          className="text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors inline-block mt-0.5"
                        >
                          Challenge: {item.challenge.title} →
                        </Link>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Reviewer Feedback Quote */}
                    {item.reviewerFeedback && (
                      <div className="p-3 rounded-xl bg-white/[0.02] border-l-2 border-emerald-500 text-xs font-mono text-slate-300 italic">
                        "{item.reviewerFeedback}"
                      </div>
                    )}

                    {/* Meta Row: XP & Date */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                        <span>+{item.challenge?.points || 400} XP Awarded</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Completed {formatDate(item.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Links */}
                  <div className="flex flex-wrap lg:flex-col items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                    {item.githubUrl && (
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Github className="h-3.5 w-3.5" />}
                          className="w-full text-xs font-mono"
                        >
                          Repository
                        </Button>
                      </a>
                    )}

                    {item.demoUrl && (
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                          className="w-full text-xs font-mono"
                        >
                          Live Demo
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. RECENT SUBMISSIONS */}
        {/* ========================================================================= */}
        <section aria-labelledby="recent-submissions-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <FileCheck className="h-4 w-4" />
              </div>
              <h2
                id="recent-submissions-heading"
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                Recent Submissions
              </h2>
            </div>

            <span className="text-xs font-mono text-slate-400">
              All lifecycle pull requests & deployments
            </span>
          </div>

          <Card className="border-white/[0.08] bg-[#111726]/90 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs uppercase text-slate-400">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">
                      Project Name
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Challenge
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-center">
                      Status
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      Date
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-xs">
                  {userSubmissionsList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-4 font-sans font-semibold text-white">
                        {item.projectName}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {item.challenge ? (
                          <Link
                            href={`/challenges/${item.challenge.slug}`}
                            className="hover:text-emerald-400 transition-colors"
                          >
                            {item.challenge.title}
                          </Link>
                        ) : (
                          "Git Club Challenge"
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400 font-mono-num">
                        {formatDate(item.submittedAt)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {item.challenge && (
                          <Link href={`/challenges/${item.challenge.slug}`}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              Details
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-white/[0.06]">
              {userSubmissionsList.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{item.projectName}</h4>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <p className="text-xs font-mono text-slate-400">
                    {item.challenge ? item.challenge.title : "Challenge Submission"}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-500">
                    <span>{formatDate(item.submittedAt)}</span>
                    {item.challenge && (
                      <Link
                        href={`/challenges/${item.challenge.slug}`}
                        className="text-emerald-400 hover:underline"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* 6. EDIT PROFILE MODAL */}
        {/* ========================================================================= */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-emerald-400" />
              <span>Edit Participant Profile</span>
            </div>
          }
          description="Update your public profile details. Changes are persisted locally in your browser session."
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveProfile}
                className="font-bold shadow-md shadow-emerald-500/20"
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2">
                Avatar Preview & Preset Selection
              </label>
              <div className="flex items-center gap-4">
                <Avatar src={formData.avatar} name={formData.name} size="lg" />
                <div className="flex flex-wrap items-center gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: preset })}
                      className={`h-9 w-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        formData.avatar === preset
                          ? "border-emerald-400 ring-2 ring-emerald-500/30 scale-105"
                          : "border-white/[0.1] hover:border-white/[0.3] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name & Username Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-xs font-mono text-slate-300 mb-1 font-semibold"
                >
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kavya Patel"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-white/[0.12] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-username"
                  className="block text-xs font-mono text-slate-300 mb-1 font-semibold"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    @
                  </span>
                  <input
                    id="edit-username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.replace(/^@/, ""),
                      })
                    }
                    placeholder="kavyapatel"
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-[#090d16] border border-white/[0.12] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Branch & Year Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-branch"
                  className="block text-xs font-mono text-slate-300 mb-1 font-semibold"
                >
                  Branch & Faculty
                </label>
                <select
                  id="edit-branch"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-year"
                  className="block text-xs font-mono text-slate-300 mb-1 font-semibold"
                >
                  Academic Year
                </label>
                <select
                  id="edit-year"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-white/[0.12] text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {YEAR_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Bio */}
            <div>
              <label
                htmlFor="edit-bio"
                className="block text-xs font-mono text-slate-300 mb-1 font-semibold"
              >
                Short Bio
              </label>
              <textarea
                id="edit-bio"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your technical interests, favorite tech stack, or campus projects..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-white/[0.12] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </form>
        </Modal>

        {/* Badge Details & GitHub Markdown Share Modal */}
        <BadgeDetailModal
          badge={selectedBadge}
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
          isUnlocked={userProfile.badges.some((b) => b.id === selectedBadge?.id)}
        />
      </div>
    </div>
  );
}
