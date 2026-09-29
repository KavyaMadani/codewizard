"use client";

import React, { useMemo } from "react";
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
  Avatar,
} from "@/components/ui";
import {
  Code2,
  Clock,
  Users,
  Flame,
  Trophy,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  Play,
  TrendingUp,
  Target,
  ArrowUpRight,
  Bookmark,
} from "lucide-react";
import { SAMPLE_ACTIVITIES } from "@/data/activity";

export default function DashboardPage() {
  const { challenges, userProfile, activeChallengeIds, getChallengeStatus } =
    useChallenges();

  // Find the current active challenge the user is working on
  const activeChallengeId = activeChallengeIds[0] || "gc-01";
  const continueChallenge = useMemo(() => {
    return challenges.find((c) => c.id === activeChallengeId) || challenges[0];
  }, [challenges, activeChallengeId]);

  // Featured 3-4 active challenges to display
  const activeChallengesList = useMemo(() => {
    return challenges
      .filter((c) => c.status === "Active" && c.id !== continueChallenge?.id)
      .slice(0, 3);
  }, [challenges, continueChallenge]);

  // Challenges sorted by nearest upcoming deadline
  const upcomingDeadlines = useMemo(() => {
    return [...challenges]
      .filter((c) => new Date(c.deadline).getTime() > Date.now())
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      )
      .slice(0, 4);
  }, [challenges]);

  // Format days remaining
  const getDaysRemaining = (deadlineStr: string) => {
    const diffTime = new Date(deadlineStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Due today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  // Next level calculation: Level 3 (2000 XP) -> Level 4 (3000 XP)
  const currentLevel = Math.floor(userProfile.xp / 1000) + 1;
  const nextLevelXp = currentLevel * 1000;
  const currentLevelBaseXp = (currentLevel - 1) * 1000;
  const levelProgress = Math.round(
    ((userProfile.xp - currentLevelBaseXp) / 1000) * 100
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0d1322] p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <Badge variant="default" size="sm">
              GIT CLUB CHARUSAT • ARENA DASHBOARD
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Build. Compete. <span className="text-emerald-400">Level Up.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Welcome back, <span className="text-white font-semibold">{userProfile.name}</span> ({userProfile.studentId}).
            Solve real-world engineering challenges across Web, AI/ML, Cloud, and Systems.
            Submit production code, earn XP points, and represent {userProfile.branch} on the university leaderboard.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Explore Challenges
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Trophy className="h-4 w-4 text-indigo-400" />}
              >
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Card */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#111726] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Total XP</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
              {userProfile.xp.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-emerald-400 ml-1.5 font-semibold">
              XP
            </span>
            <p className="mt-1 text-xs text-slate-400 font-mono">
              Level {currentLevel} Developer • {1000 - (userProfile.xp % 1000)} to next tier
            </p>
          </div>
        </div>

        {/* Challenges Completed Card */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#111726] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
              {userProfile.challengesCompleted}
            </span>
            <span className="text-xs font-mono text-slate-400 ml-1.5">
              / {challenges.length} solved
            </span>
            <p className="mt-1 text-xs text-slate-400 font-mono">
              {Math.round((userProfile.challengesCompleted / challenges.length) * 100)}% overall completion
            </p>
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#111726] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Active Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="h-4 w-4 fill-amber-400/40 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
              {userProfile.currentStreak}
            </span>
            <span className="text-xs font-mono text-amber-400 ml-1.5 font-semibold">
              Days
            </span>
            <p className="mt-1 text-xs text-slate-400 font-mono">
              Build today to keep streak active
            </p>
          </div>
        </div>

        {/* Current Rank Card */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#111726] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Current Rank</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
              #{userProfile.rank}
            </span>
            <span className="text-xs font-mono text-indigo-400 ml-1.5">
              Leaderboard
            </span>
            <p className="mt-1 text-xs text-slate-400 font-mono">
              Top 5% across CHARUSAT
            </p>
          </div>
        </div>
      </section>

      {/* 3. CONTINUE CHALLENGE (In-Progress Highlight) */}
      {continueChallenge && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Continue Challenge
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Active in local workspace
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#111726] via-[#121c2c] to-[#111726] p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <DifficultyBadge difficulty={continueChallenge.difficulty} size="sm" />
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-emerald-300">
                    {continueChallenge.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    +{continueChallenge.points} XP on completion
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {continueChallenge.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {continueChallenge.shortDescription}
                </p>

                {/* Progress bar and milestone */}
                <div className="pt-2 max-w-lg">
                  <ProgressBar
                    value={60}
                    label="Implementation Progress"
                    sublabel="3 of 5 Requirements Verified"
                    showPercentage
                    size="sm"
                    variant="emerald"
                  />
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/[0.08]">
                <div className="text-left lg:text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[11px] uppercase">
                    Deadline
                  </span>
                  <span className="text-white font-semibold">
                    {new Date(continueChallenge.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="block text-amber-400 text-[11px]">
                    ({getDaysRemaining(continueChallenge.deadline)})
                  </span>
                </div>

                <Link href={`/challenges/${continueChallenge.id}`}>
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                  >
                    Continue Challenge
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. ACTIVE CHALLENGES (Grid of 3-4 cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Active Challenges
            </h2>
          </div>
          <Link
            href="/"
            className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>View All ({challenges.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeChallengesList.map((challenge) => {
            const status = getChallengeStatus(challenge.id);
            return (
              <Card
                key={challenge.id}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300">
                          {challenge.category}
                        </span>
                      </div>
                      <StatusBadge status={status} size="sm" />
                    </div>

                    <CardTitle className="text-base sm:text-lg line-clamp-1">
                      {challenge.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {challenge.shortDescription}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Technologies tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {challenge.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-white/[0.06] text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Stats strip */}
                    <div className="pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">
                          Points
                        </span>
                        <span className="font-semibold text-emerald-400 font-mono-num">
                          +{challenge.points} XP
                        </span>
                      </div>
                      <div className="border-x border-white/[0.06]">
                        <span className="text-[10px] text-slate-500 uppercase block">
                          Duration
                        </span>
                        <span className="font-semibold text-slate-300 font-mono-num">
                          {challenge.duration}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">
                          Builders
                        </span>
                        <span className="font-semibold text-slate-300 font-mono-num flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-slate-500" />
                          {challenge.participants}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{getDaysRemaining(challenge.deadline)}</span>
                  </div>

                  <Link href={`/challenges/${challenge.id}`}>
                    <Button
                      size="sm"
                      variant="secondary"
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      className="text-xs"
                    >
                      View Challenge
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. TWO-COLUMN SPLIT: UPCOMING DEADLINES & RECENT ACTIVITY */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* UPCOMING DEADLINES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Upcoming Deadlines
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Sorted by nearest
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111726] divide-y divide-white/[0.06] overflow-hidden">
            {upcomingDeadlines.map((challenge) => {
              const daysLeft = getDaysRemaining(challenge.deadline);
              const isUrgent = daysLeft.includes("1 day") || daysLeft.includes("Due today");

              return (
                <div
                  key={challenge.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-400">
                        {challenge.category}
                      </span>
                      <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                    </div>
                    <Link
                      href={`/challenges/${challenge.id}`}
                      className="block text-sm font-semibold text-white hover:text-emerald-400 transition-colors truncate"
                    >
                      {challenge.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>+{challenge.points} XP</span>
                      <span>•</span>
                      <span>{challenge.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded-md border font-medium ${
                        isUrgent
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                      }`}
                    >
                      {daysLeft}
                    </span>
                    <Link href={`/challenges/${challenge.id}`}>
                      <span className="text-xs font-mono text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors">
                        Details <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Recent Activity
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Live developer feed
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#111726] divide-y divide-white/[0.06] overflow-hidden">
            {SAMPLE_ACTIVITIES.map((activity) => {
              const icons = {
                challenge_started: <Play className="h-4 w-4 text-emerald-400" />,
                submission_made: <CheckCircle2 className="h-4 w-4 text-cyan-400" />,
                badge_earned: <Award className="h-4 w-4 text-amber-400" />,
                challenge_completed: <Trophy className="h-4 w-4 text-indigo-400" />,
              };

              return (
                <div
                  key={activity.id}
                  className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-white/[0.08] shrink-0 mt-0.5">
                    {icons[activity.type] || <Sparkles className="h-4 w-4 text-emerald-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white tracking-tight">
                        {activity.title}
                      </p>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {activity.description}
                    </p>
                    {activity.xpAwarded && (
                      <span className="inline-block mt-1.5 text-[11px] font-mono text-emerald-400 font-semibold">
                        +{activity.xpAwarded} XP Earned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. YOUR PROGRESS SECTION (Gamification & Breakdown) */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#111726] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Your Progress & Skill Mastery
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Track your leveling progress, unlocked achievements, and category coverage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Current Standing:</span>
            <Badge variant="default" size="sm">
              Rank #{userProfile.rank} on Leaderboard
            </Badge>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-semibold">
              Level {currentLevel} Senior Crafter
            </span>
            <span className="text-emerald-400 font-mono-num font-semibold">
              {userProfile.xp} / {nextLevelXp} XP ({levelProgress}%)
            </span>
          </div>
          <ProgressBar
            value={levelProgress}
            size="md"
            variant="emerald"
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Level {currentLevel} Base ({currentLevelBaseXp} XP)</span>
            <span>Level {currentLevel + 1} Master ({nextLevelXp} XP)</span>
          </div>
        </div>

        {/* Category Breakdown & Badges Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Category Mastery */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Category Distribution
            </h4>
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Web Development</span>
                  <span>2 Solved</span>
                </div>
                <ProgressBar value={66} size="sm" variant="emerald" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>App Development</span>
                  <span>1 Solved</span>
                </div>
                <ProgressBar value={33} size="sm" variant="cyan" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>UI/UX Interface Design</span>
                  <span>1 Solved</span>
                </div>
                <ProgressBar value={33} size="sm" variant="indigo" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Cybersecurity & CTF</span>
                  <span>In Progress</span>
                </div>
                <ProgressBar value={20} size="sm" variant="amber" />
              </div>
            </div>
          </div>

          {/* Badges Unlocked Showcase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Unlocked Badges ({userProfile.badges.length})
              </h4>
              <Link href="/leaderboard" className="text-[11px] font-mono text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {userProfile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 rounded-xl border border-white/[0.08] bg-slate-900/60 text-center flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-white block truncate w-full">
                    {badge.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block truncate w-full">
                    {badge.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
