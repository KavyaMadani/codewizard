"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useChallenges } from "@/context/ChallengeContext";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  SearchInput,
} from "@/components/ui";
import {
  Trophy,
  Flame,
  Award,
  Sparkles,
  Medal,
  CheckCircle2,
  Users,
  Search,
  Zap,
  Info,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Target,
  ShieldAlert,
  Code2,
  Lock,
  Cpu,
  Crown,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { LeaderboardUser, Badge as BadgeType } from "@/types";

// Helper to map badge icons dynamically
function renderBadgeIcon(iconName: string, className = "h-3.5 w-3.5") {
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

// Timeframe filter options
type Timeframe = "This Week" | "This Month" | "All Time";

// Sortable column keys
type SortKey = "rank" | "xp" | "challengesCompleted" | "currentStreak";

export default function LeaderboardPage() {
  const { leaderboard, userProfile } = useChallenges();

  // Filters state
  const [timeframe, setTimeframe] = useState<Timeframe>("All Time");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<"All" | "CSPIT" | "DEPSTAR">("All");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Ref to scroll to current user row
  const currentUserRowRef = useRef<HTMLTableRowElement | null>(null);
  const currentUserCardRef = useRef<HTMLDivElement | null>(null);

  // Derive timeframe-adjusted stats for all participants
  const timeframeData = useMemo(() => {
    return leaderboard.map((user) => {
      // Deterministic variations for weekly and monthly sprint simulations
      if (timeframe === "This Week") {
        let weeklyXp = 0;
        let weeklySolved = 0;

        // Custom realistic distribution for "This Week"
        if (user.isCurrentUser) {
          weeklyXp = 550;
          weeklySolved = 1;
        } else if (user.username === "diyacodes") {
          weeklyXp = 650;
          weeklySolved = 1;
        } else if (user.username === "aarav_kernel") {
          weeklyXp = 450;
          weeklySolved = 1;
        } else if (user.username === "meet_devops") {
          weeklyXp = 400;
          weeklySolved = 1;
        } else if (user.username === "sid_sec") {
          weeklyXp = 350;
          weeklySolved = 1;
        } else if (user.username === "ananyadesai") {
          weeklyXp = 250;
          weeklySolved = 0;
        } else {
          // Fallback proportional calculation
          weeklyXp = Math.max(50, Math.round((user.xp % 700) + 100));
          weeklySolved = user.challengesCompleted > 4 ? 1 : 0;
        }

        return {
          ...user,
          xp: weeklyXp,
          challengesCompleted: weeklySolved,
          solvedCount: weeklySolved,
        };
      }

      if (timeframe === "This Month") {
        let monthlyXp = 0;
        let monthlySolved = 0;

        // Custom realistic distribution for "This Month"
        if (user.isCurrentUser) {
          monthlyXp = 1150;
          monthlySolved = 2;
        } else if (user.username === "diyacodes") {
          monthlyXp = 1600;
          monthlySolved = 4;
        } else if (user.username === "aarav_kernel") {
          monthlyXp = 1450;
          monthlySolved = 3;
        } else if (user.username === "meet_devops") {
          monthlyXp = 1050;
          monthlySolved = 2;
        } else if (user.username === "rohan_ml") {
          monthlyXp = 950;
          monthlySolved = 2;
        } else {
          // Fallback proportional calculation
          monthlyXp = Math.max(300, Math.round(user.xp * 0.42));
          monthlySolved = Math.max(1, Math.round(user.challengesCompleted * 0.4));
        }

        return {
          ...user,
          xp: monthlyXp,
          challengesCompleted: monthlySolved,
          solvedCount: monthlySolved,
        };
      }

      // "All Time" uses the full profile numbers
      return {
        ...user,
        xp: user.isCurrentUser ? userProfile.xp : user.xp,
        challengesCompleted: user.isCurrentUser
          ? userProfile.challengesCompleted
          : user.challengesCompleted,
      };
    });
  }, [leaderboard, timeframe, userProfile.xp, userProfile.challengesCompleted]);

  // Rank participants based on current timeframe XP
  const rankedUsers = useMemo(() => {
    const list = [...timeframeData];
    list.sort((a, b) => b.xp - a.xp);
    return list.map((user, idx) => ({
      ...user,
      timeframeRank: idx + 1,
    }));
  }, [timeframeData]);

  // Filtered by Search & Faculty
  const filteredUsers = useMemo(() => {
    return rankedUsers.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.branch.toLowerCase().includes(q) ||
        (user.studentId && user.studentId.toLowerCase().includes(q));

      const matchesFaculty =
        selectedFaculty === "All" ||
        (selectedFaculty === "CSPIT" && user.branch.includes("CSPIT")) ||
        (selectedFaculty === "DEPSTAR" && user.branch.includes("DEPSTAR"));

      return matchesSearch && matchesFaculty;
    });
  }, [rankedUsers, searchQuery, selectedFaculty]);

  // Sorted list for table display
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      let aVal = a[sortKey as keyof typeof a];
      let bVal = b[sortKey as keyof typeof b];

      // Handle rank sorting specifically
      if (sortKey === "rank") {
        aVal = a.timeframeRank;
        bVal = b.timeframeRank;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
    return sorted;
  }, [filteredUsers, sortKey, sortDirection]);

  // Handle column header sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "rank" ? "asc" : "desc");
    }
  };

  // Identify Top 3 for the Podium
  const topThree = useMemo(() => {
    return {
      first: rankedUsers[0],
      second: rankedUsers[1],
      third: rankedUsers[2],
    };
  }, [rankedUsers]);

  // Identify Current User in the ranked list
  const currentUserRanked = useMemo(() => {
    return rankedUsers.find((u) => u.isCurrentUser) || rankedUsers[3];
  }, [rankedUsers]);

  // Gap to next rank
  const gapToNextRank = useMemo(() => {
    if (!currentUserRanked || currentUserRanked.timeframeRank <= 1) return null;
    const userAbove = rankedUsers[currentUserRanked.timeframeRank - 2];
    if (!userAbove) return null;
    return userAbove.xp - currentUserRanked.xp;
  }, [currentUserRanked, rankedUsers]);

  // Scroll to current user
  const scrollToCurrentUser = () => {
    if (currentUserRowRef.current) {
      currentUserRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else if (currentUserCardRef.current) {
      currentUserCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <div className="relative min-h-screen pb-24 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ========================================================================= */}
        {/* 1. HEADER */}
        {/* ========================================================================= */}
        <div className="relative pb-8 border-b border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>CHARUSAT Student Developer Arena</span>
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span className="text-slate-400">{timeframe} Standings</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Community Leaderboard
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Build consistently. Learn publicly. Grow together.
              </p>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/progress">
                <Button variant="secondary" size="md" className="font-mono text-xs">
                  My Challenge Journey
                </Button>
              </Link>
              <Link href="/challenges">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Join Challenge
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DEMO NOTICE (Explanatory Note) */}
        {/* ========================================================================= */}
        <div className="flex items-start sm:items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold text-white">Leaderboard Simulation Note: </span>
            This community leaderboard displays verified participants using mock and demo data for the
            CHARUSAT developer community. Rankings, XP, and weekly cadence simulate live sprint
            submissions and peer code evaluations.
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. YOUR POSITION (Prominent Current User Banner) */}
        {/* ========================================================================= */}
        {currentUserRanked && (
          <section aria-labelledby="your-position-heading">
            <Card className="border-emerald-500/40 bg-gradient-to-r from-[#121c2e] via-[#101726] to-[#0f1524] p-5 sm:p-6 shadow-lg shadow-emerald-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Left: User Identity & Rank */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      src={currentUserRanked.avatar}
                      name={currentUserRanked.name}
                      size="lg"
                      status="online"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-mono text-xs font-black shadow-md">
                      #{currentUserRanked.timeframeRank}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span id="your-position-heading" className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        Your Position
                      </span>
                      <Badge variant="success" size="sm">
                        Active Participant
                      </Badge>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {currentUserRanked.name}
                    </h2>

                    <p className="text-xs font-mono text-slate-400">
                      {currentUserRanked.year} • {currentUserRanked.branch} ({currentUserRanked.studentId || "23IT089"})
                    </p>
                  </div>
                </div>

                {/* Center / Right: Key Stats & Action */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
                  {/* Current Rank */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      {timeframe} Rank
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-white font-mono-num flex items-center gap-1.5">
                      <span className="text-emerald-400">#{currentUserRanked.timeframeRank}</span>
                      <span className="text-xs text-slate-400 font-normal">of {rankedUsers.length}</span>
                    </div>
                  </div>

                  {/* Current XP */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      {timeframe} XP
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono-num flex items-center gap-1">
                      <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                      <span>{currentUserRanked.xp.toLocaleString()} XP</span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Active Streak
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono-num flex items-center gap-1">
                      <Flame className="h-4 w-4 fill-amber-400/40" />
                      <span>{currentUserRanked.currentStreak} Days</span>
                    </div>
                  </div>

                  {/* Jump button */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={scrollToCurrentUser}
                      className="font-mono text-xs hover:border-emerald-500/50"
                    >
                      Find Me in Table
                    </Button>
                  </div>
                </div>
              </div>

              {/* Informative Sub-bar */}
              {gapToNextRank !== null && gapToNextRank > 0 && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      Earn <strong className="text-white">{gapToNextRank} more XP</strong> to overtake Rank #{currentUserRanked.timeframeRank - 1}!
                    </span>
                  </div>
                  <span className="text-emerald-400 font-semibold hidden sm:inline">
                    Top {Math.round((currentUserRanked.timeframeRank / rankedUsers.length) * 100)}% of builders
                  </span>
                </div>
              )}
            </Card>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. TOP 3 PODIUM (1st, 2nd, 3rd with distinct heights & styling) */}
        {/* ========================================================================= */}
        <section aria-labelledby="top-three-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <h2 id="top-three-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Top 3 Podium
                </h2>
              </div>
            </div>

            {/* Timeframe Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111726] border border-white/[0.08] self-start sm:self-auto">
              {(["This Week", "This Month", "All Time"] as const).map((t) => {
                const isActive = timeframe === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Podium Grid (2nd Left, 1st Center Elevated, 3rd Right) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-end">
            {/* ================= 2ND PLACE (SILVER) ================= */}
            {topThree.second && (
              <div className="order-2 md:order-1 flex flex-col justify-end">
                <Card className="border-slate-400/30 bg-gradient-to-b from-[#131b2a] to-[#0f1422] p-6 text-center space-y-4 relative shadow-lg hover:border-slate-300/40 transition-colors">
                  <div className="absolute top-3 right-3 text-slate-400 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08]">
                    #2 SILVER
                  </div>

                  <div className="relative inline-block mx-auto pt-2">
                    <div className="p-1 rounded-full ring-2 ring-slate-400/60 bg-slate-400/10">
                      <Avatar src={topThree.second.avatar} name={topThree.second.name} size="xl" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-slate-300 text-slate-950 shadow-md">
                      <Medal className="h-4 w-4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-base font-bold text-white">{topThree.second.name}</h3>
                      {topThree.second.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{topThree.second.branch}</p>
                    <span className="text-[11px] font-mono text-slate-500">@{topThree.second.username}</span>
                  </div>

                  {/* XP & Solved Row */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-center gap-4 text-xs font-mono">
                    <span className="text-emerald-400 font-bold font-mono-num flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                      {topThree.second.xp.toLocaleString()} XP
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">
                      {topThree.second.challengesCompleted} Solved
                    </span>
                  </div>

                  {/* Silver Pedestal Base */}
                  <div className="h-10 rounded-xl bg-gradient-to-t from-slate-400/20 via-slate-400/10 to-transparent border-t border-slate-400/30 flex items-center justify-center font-mono text-sm font-bold text-slate-300">
                    2nd Position
                  </div>
                </Card>
              </div>
            )}

            {/* ================= 1ST PLACE (GOLD CHAMPION) ================= */}
            {topThree.first && (
              <div className="order-1 md:order-2 flex flex-col justify-end">
                <Card className="border-2 border-amber-400/50 bg-gradient-to-b from-[#1c2738] via-[#141d2d] to-[#101726] p-7 text-center space-y-4 relative shadow-2xl shadow-amber-950/20 hover:border-amber-400/70 transition-colors">
                  {/* Champion Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold mx-auto">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                    <span>#1 SPRINT CHAMPION</span>
                  </div>

                  <div className="relative inline-block mx-auto pt-1">
                    <div className="p-1.5 rounded-full ring-4 ring-amber-400/70 bg-amber-400/20 shadow-lg shadow-amber-500/20">
                      <Avatar src={topThree.first.avatar} name={topThree.first.name} size="xl" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30">
                      <Trophy className="h-4 w-4 fill-slate-950" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-lg font-extrabold text-white tracking-tight">
                        {topThree.first.name}
                      </h3>
                      {topThree.first.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-emerald-400 mt-0.5">{topThree.first.branch}</p>
                    <span className="text-[11px] font-mono text-slate-400">@{topThree.first.username}</span>
                  </div>

                  {/* XP & Solved Row */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-center gap-4 text-xs font-mono">
                    <span className="text-emerald-300 font-extrabold text-sm font-mono-num flex items-center gap-1">
                      <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                      {topThree.first.xp.toLocaleString()} XP
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400 flex items-center gap-1 font-semibold">
                      <Flame className="h-3.5 w-3.5 fill-amber-400/40" />
                      {topThree.first.currentStreak}d Streak
                    </span>
                  </div>

                  {/* Gold Elevated Pedestal Base */}
                  <div className="h-14 rounded-xl bg-gradient-to-t from-amber-400/25 via-amber-400/10 to-transparent border-t border-amber-400/40 flex items-center justify-center font-mono text-sm font-black text-amber-300 tracking-wider">
                    🏆 1st Position
                  </div>
                </Card>
              </div>
            )}

            {/* ================= 3RD PLACE (BRONZE) ================= */}
            {topThree.third && (
              <div className="order-3 md:order-3 flex flex-col justify-end">
                <Card className="border-amber-700/40 bg-gradient-to-b from-[#151926] to-[#0f1422] p-6 text-center space-y-4 relative shadow-lg hover:border-amber-600/50 transition-colors">
                  <div className="absolute top-3 right-3 text-amber-500 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08]">
                    #3 BRONZE
                  </div>

                  <div className="relative inline-block mx-auto pt-2">
                    <div className="p-1 rounded-full ring-2 ring-amber-700/60 bg-amber-700/10">
                      <Avatar src={topThree.third.avatar} name={topThree.third.name} size="xl" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-amber-700 text-amber-100 shadow-md">
                      <Medal className="h-4 w-4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-center gap-1.5">
                      <h3 className="text-base font-bold text-white">{topThree.third.name}</h3>
                      {topThree.third.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{topThree.third.branch}</p>
                    <span className="text-[11px] font-mono text-slate-500">@{topThree.third.username}</span>
                  </div>

                  {/* XP & Solved Row */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-center gap-4 text-xs font-mono">
                    <span className="text-emerald-400 font-bold font-mono-num flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                      {topThree.third.xp.toLocaleString()} XP
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">
                      {topThree.third.challengesCompleted} Solved
                    </span>
                  </div>

                  {/* Bronze Pedestal Base */}
                  <div className="h-8 rounded-xl bg-gradient-to-t from-amber-700/20 via-amber-700/10 to-transparent border-t border-amber-700/30 flex items-center justify-center font-mono text-xs font-bold text-amber-400">
                    3rd Position
                  </div>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. SEARCH & FACULTY CONTROLS */}
        {/* ========================================================================= */}
        <section aria-labelledby="rankings-list-heading" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Users className="h-4 w-4" />
              </div>
              <h2 id="rankings-list-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Ranked Standings
              </h2>
              <span className="text-xs font-mono text-slate-400">
                ({filteredUsers.length} Participants)
              </span>
            </div>

            {/* Search Input & Faculty Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="w-full sm:w-64">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search student, branch, or ID..."
                />
              </div>

              {/* Faculty Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111726] border border-white/[0.08] self-start sm:self-auto">
                {(["All", "CSPIT", "DEPSTAR"] as const).map((fac) => (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => setSelectedFaculty(fac)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      selectedFaculty === fac
                        ? "bg-white/[0.1] text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {fac === "All" ? "All Faculties" : fac}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. DESKTOP RANKED TABLE (Hidden on Mobile) */}
          {/* ========================================================================= */}
          <div className="hidden md:block rounded-2xl border border-white/[0.08] bg-[#111726]/90 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono uppercase text-slate-400">
                  <tr>
                    {/* Rank */}
                    <th
                      scope="col"
                      onClick={() => handleSort("rank")}
                      className="py-3.5 px-4 w-20 text-center cursor-pointer hover:text-white transition-colors select-none"
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>Rank</span>
                        {sortKey === "rank" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>

                    {/* Participant */}
                    <th scope="col" className="py-3.5 px-4">
                      Participant
                    </th>

                    {/* Year / Branch */}
                    <th scope="col" className="py-3.5 px-4">
                      Year / Branch
                    </th>

                    {/* XP */}
                    <th
                      scope="col"
                      onClick={() => handleSort("xp")}
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    >
                      <div className="inline-flex items-center justify-end gap-1 w-full">
                        <span>XP</span>
                        {sortKey === "xp" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>

                    {/* Challenges Completed */}
                    <th
                      scope="col"
                      onClick={() => handleSort("challengesCompleted")}
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                    >
                      <div className="inline-flex items-center justify-center gap-1 w-full">
                        <span>Challenges Completed</span>
                        {sortKey === "challengesCompleted" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>

                    {/* Streak */}
                    <th
                      scope="col"
                      onClick={() => handleSort("currentStreak")}
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                    >
                      <div className="inline-flex items-center justify-center gap-1 w-full">
                        <span>Streak</span>
                        {sortKey === "currentStreak" && (
                          sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>

                    {/* Badges */}
                    <th scope="col" className="py-3.5 px-4 text-center">
                      Badges
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {sortedUsers.map((user) => {
                    const isCurrent = user.isCurrentUser;
                    const rankNum = user.timeframeRank;

                    return (
                      <tr
                        key={user.id}
                        ref={isCurrent ? currentUserRowRef : null}
                        className={`transition-colors duration-150 font-mono text-xs ${
                          isCurrent
                            ? "bg-emerald-500/10 hover:bg-emerald-500/15 border-l-4 border-l-emerald-400"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        {/* 1. Rank */}
                        <td className="py-4 px-4 text-center font-bold">
                          {rankNum === 1 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs">
                              🥇
                            </span>
                          ) : rankNum === 2 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 text-xs">
                              🥈
                            </span>
                          ) : rankNum === 3 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700/20 text-amber-300 border border-amber-700/40 text-xs">
                              🥉
                            </span>
                          ) : (
                            <span className={`font-mono font-semibold ${isCurrent ? "text-emerald-400" : "text-slate-400"}`}>
                              #{rankNum}
                            </span>
                          )}
                        </td>

                        {/* 2. Participant */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={user.avatar} name={user.name} size="sm" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold font-sans text-sm">
                                  {user.name}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-500 text-[11px] block mt-0.5">
                                @{user.username} {user.studentId ? `• ${user.studentId}` : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Year / Branch */}
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{user.year || "3rd Year"}</span>
                            <span className="text-slate-400 text-[11px] truncate max-w-[220px]">
                              {user.branch}
                            </span>
                          </div>
                        </td>

                        {/* 4. XP */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 text-emerald-400 font-extrabold font-mono-num text-sm">
                            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                            <span>{user.xp.toLocaleString()} XP</span>
                          </div>
                        </td>

                        {/* 5. Challenges Completed */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-slate-200 font-mono-num font-semibold bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{user.challengesCompleted} Solved</span>
                          </span>
                        </td>

                        {/* 6. Streak */}
                        <td className="py-4 px-4 text-center text-amber-400 font-mono-num font-semibold">
                          <span className="inline-flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 fill-amber-400/30" />
                            <span>{user.currentStreak}d</span>
                          </span>
                        </td>

                        {/* 7. Badges */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {user.badges && user.badges.length > 0 ? (
                              <>
                                {user.badges.slice(0, 3).map((badge) => (
                                  <div
                                    key={badge.id}
                                    title={badge.name}
                                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] border border-white/[0.08]"
                                  >
                                    {renderBadgeIcon(badge.icon, "h-3.5 w-3.5")}
                                  </div>
                                ))}
                                {user.badges.length > 3 && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    +{user.badges.length - 3}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-600 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. MOBILE RESPONSIVE CARDS (Rendered on < md screens) */}
          {/* ========================================================================= */}
          <div className="block md:hidden space-y-3">
            {sortedUsers.map((user) => {
              const isCurrent = user.isCurrentUser;
              const rankNum = user.timeframeRank;

              return (
                <div key={user.id} ref={isCurrent ? currentUserCardRef : null}>
                  <Card
                    className={`p-4 border transition-colors ${
                      isCurrent
                        ? "border-emerald-500/40 bg-gradient-to-r from-[#121c2e] via-[#101726] to-[#101726] shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/30"
                        : "border-white/[0.08] bg-[#111726]/90"
                    }`}
                  >
                  {/* Top Bar: Rank, Avatar, Name, "You" Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Rank Indicator */}
                      <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-white/[0.04] border border-white/[0.08] font-mono text-xs font-bold shrink-0">
                        {rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : `#${rankNum}`}
                      </div>

                      <Avatar src={user.avatar} name={user.name} size="sm" />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white leading-tight">
                            {user.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          @{user.username} {user.studentId ? `• ${user.studentId}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* XP Tag */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-emerald-400 font-mono-num">
                        {user.xp.toLocaleString()} XP
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {timeframe}
                      </span>
                    </div>
                  </div>

                  {/* Middle Tag: Year & Branch */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="text-slate-400">{user.year || "3rd Year"}</span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                      {user.branch}
                    </span>
                  </div>

                  {/* Bottom Stats Grid: Solved, Streak, Badges */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block uppercase">Solved</span>
                      <span className="text-white font-bold font-mono-num">
                        {user.challengesCompleted}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block uppercase">Streak</span>
                      <span className="text-amber-400 font-bold font-mono-num flex items-center justify-center gap-1">
                        <Flame className="h-3 w-3 fill-amber-400/40" />
                        {user.currentStreak}d
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-slate-500 block uppercase">Badges</span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        {user.badges && user.badges.slice(0, 2).map((b) => (
                          <div key={b.id} title={b.name}>
                            {renderBadgeIcon(b.icon, "h-3 w-3")}
                          </div>
                        ))}
                        {user.badges && user.badges.length > 2 && (
                          <span className="text-[10px] text-slate-500">
                            +{user.badges.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              );
            })}
          </div>

          {/* Empty Search State */}
          {sortedUsers.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-white/[0.08] bg-[#111726]/60 p-8 space-y-3">
              <Search className="h-8 w-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No participants found</h3>
              <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                No students match your query "{searchQuery}" in {selectedFaculty} faculty.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFaculty("All");
                }}
                className="text-xs font-mono mt-2"
              >
                Clear Search Filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
