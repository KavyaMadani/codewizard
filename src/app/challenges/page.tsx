"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useChallenges } from "@/context/ChallengeContext";
import {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeLifecycleStatus,
} from "@/types";
import {
  Button,
  Card,
  DifficultyBadge,
  StatusBadge,
  EmptyState,
  Badge,
} from "@/components/ui";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  Sparkles,
  Users,
  Code2,
  Zap,
  Clock,
  ArrowRight,
  Layers,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  FolderGit2,
  Brain,
  Smartphone,
  Palette,
  Shield,
  Radio,
} from "lucide-react";

// Category definitions
const CATEGORIES: Array<"All" | ChallengeCategory> = [
  "All",
  "Web Development",
  "AI / ML",
  "App Development",
  "UI/UX",
  "Cybersecurity",
  "IoT",
];

// Difficulty definitions
const DIFFICULTIES: Array<"All" | ChallengeDifficulty> = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

// Status definitions
const STATUSES: Array<"All" | ChallengeLifecycleStatus> = [
  "All",
  "Active",
  "Upcoming",
  "Completed",
];

// Sort definitions
type SortOption = "recommended" | "newest" | "points" | "deadline";

const SORT_OPTIONS: { label: string; value: SortOption; description: string }[] = [
  { label: "Recommended", value: "recommended", description: "Curated & trending first" },
  { label: "Newest", value: "newest", description: "Most recently added" },
  { label: "Points", value: "points", description: "Highest XP reward" },
  { label: "Deadline", value: "deadline", description: "Ending soonest" },
];

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

// Helper for relative days remaining
function getDaysRemaining(deadlineStr: string): { text: string; isUrgent: boolean } {
  try {
    const diffTime = new Date(deadlineStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Ended", isUrgent: false };
    if (diffDays === 0) return { text: "Due today", isUrgent: true };
    if (diffDays === 1) return { text: "1 day left", isUrgent: true };
    if (diffDays <= 7) return { text: `${diffDays}d left`, isUrgent: true };
    return { text: `${diffDays}d left`, isUrgent: false };
  } catch {
    return { text: "Active", isUrgent: false };
  }
}

export default function ChallengesPage() {
  const { challenges, getChallengeStatus } = useChallenges();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"All" | ChallengeLifecycleStatus>("All");
  const [selectedCategory, setSelectedCategory] = useState<"All" | ChallengeCategory>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | ChallengeDifficulty>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | ChallengeLifecycleStatus>("All");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Sync tab clicks with status filter
  const handleTabChange = (tab: "All" | ChallengeLifecycleStatus) => {
    setSelectedTab(tab);
    setSelectedStatus(tab);
  };

  // Sync status dropdown with tab
  const handleStatusChange = (status: "All" | ChallengeLifecycleStatus) => {
    setSelectedStatus(status);
    setSelectedTab(status);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
    setSelectedStatus("All");
    setSelectedTab("All");
    setSortBy("recommended");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedDifficulty !== "All" ||
    selectedStatus !== "All" ||
    sortBy !== "recommended";

  // Filter and sort challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Search matching (Title, Description, or Technology)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = c.title.toLowerCase().includes(query);
        const shortDescMatch = c.shortDescription?.toLowerCase().includes(query);
        const descMatch = c.description?.toLowerCase().includes(query);
        const techMatch = c.technologies?.some((tech) =>
          tech.toLowerCase().includes(query)
        );
        const categoryMatch = c.category?.toLowerCase().includes(query);

        if (!titleMatch && !shortDescMatch && !descMatch && !techMatch && !categoryMatch) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "All" && c.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "All" && c.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "All" && c.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [challenges, searchQuery, selectedCategory, selectedDifficulty, selectedStatus]);

  // Sort challenges
  const sortedChallenges = useMemo(() => {
    const list = [...filteredChallenges];

    switch (sortBy) {
      case "recommended":
        return list.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.participants - a.participants;
        });
      case "newest":
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "points":
        return list.sort((a, b) => b.points - a.points);
      case "deadline":
        return list.sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        );
      default:
        return list;
    }
  }, [filteredChallenges, sortBy]);

  // Featured challenges (1-2 featured items for top spotlight)
  const featuredChallenges = useMemo(() => {
    return challenges.filter((c) => c.featured).slice(0, 2);
  }, [challenges]);

  // Calculate counts for badges and dropdowns
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: challenges.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "All") {
        counts[cat] = challenges.filter((c) => c.category === cat).length;
      }
    });
    return counts;
  }, [challenges]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: challenges.length };
    STATUSES.forEach((st) => {
      if (st !== "All") {
        counts[st] = challenges.filter((c) => c.status === st).length;
      }
    });
    return counts;
  }, [challenges]);

  const difficultyCounts = useMemo(() => {
    const counts: Record<string, number> = { All: challenges.length };
    DIFFICULTIES.forEach((diff) => {
      if (diff !== "All") {
        counts[diff] = challenges.filter((c) => c.difficulty === diff).length;
      }
    });
    return counts;
  }, [challenges]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        const searchInput = document.getElementById("challenge-search-input");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen pb-20 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* 1. HEADER SECTION */}
        {/* ========================================================================= */}
        <div className="relative pb-8 mb-8 border-b border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                <span>CHARUSAT Git Club Arena</span>
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span className="text-slate-400">{challenges.length} Live Challenges</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Explore Challenges
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Find your next challenge and build something worth showing.
              </p>
            </div>

            {/* Quick Aggregate Stats Pill Bar */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#111726] border border-white/[0.08] shadow-sm">
                <Zap className="h-4 w-4 text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Total XP
                  </span>
                  <span className="text-sm font-bold text-white font-mono-num">
                    {challenges.reduce((sum, c) => sum + c.points, 0).toLocaleString()} XP
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#111726] border border-white/[0.08] shadow-sm">
                <Users className="h-4 w-4 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Builders
                  </span>
                  <span className="text-sm font-bold text-white font-mono-num">
                    {challenges.reduce((sum, c) => sum + c.participants, 0).toLocaleString()} Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#111726] border border-white/[0.08] shadow-sm">
                <Layers className="h-4 w-4 text-indigo-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Tracks
                  </span>
                  <span className="text-sm font-bold text-white font-mono-num">6 Domains</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FEATURED SECTION (TOP SPOTLIGHT) */}
        {/* ========================================================================= */}
        {!hasActiveFilters && featuredChallenges.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Featured Challenges
                </h2>
                <Badge variant="warning" size="sm">
                  Spotlight
                </Badge>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                Curated high-impact real-world projects
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredChallenges.map((featured) => {
                const userStatus = getChallengeStatus(featured.id);
                const deadlineInfo = getDaysRemaining(featured.deadline);

                return (
                  <div
                    key={`featured-${featured.id}`}
                    className="relative group rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#131b2e] via-[#101726] to-[#0c121e] p-6 sm:p-7 shadow-xl shadow-emerald-950/20 overflow-hidden transition-all duration-200 hover:border-emerald-400/50 hover:shadow-emerald-900/30 hover:-translate-y-0.5"
                  >
                    {/* Glowing background accent */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />
                    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                      <div>
                        {/* Top Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-slate-200">
                              {getCategoryIcon(featured.category)}
                              <span>{featured.category}</span>
                            </span>
                            <DifficultyBadge difficulty={featured.difficulty} size="sm" />
                          </div>

                          <div className="flex items-center gap-2">
                            {userStatus !== "Active" ? (
                              <StatusBadge status={userStatus} size="sm" />
                            ) : (
                              <StatusBadge status={featured.status} size="sm" />
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <Link
                          href={`/challenges/${featured.slug}`}
                          className="group-hover:text-emerald-400 transition-colors block"
                        >
                          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                            {featured.title}
                          </h3>
                        </Link>

                        <p className="mt-2.5 text-sm text-slate-300 line-clamp-2 leading-relaxed">
                          {featured.shortDescription}
                        </p>

                        {/* Technology Badges */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {featured.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-[11px] font-mono rounded bg-white/[0.04] border border-white/[0.08] text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                          <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                            <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                            <span>{featured.points} XP</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>{featured.participants} joined</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock
                              className={`h-3.5 w-3.5 ${
                                deadlineInfo.isUrgent ? "text-amber-400" : "text-slate-400"
                              }`}
                            />
                            <span
                              className={deadlineInfo.isUrgent ? "text-amber-300 font-medium" : ""}
                            >
                              {deadlineInfo.text}
                            </span>
                          </div>
                        </div>

                        <Link href={`/challenges/${featured.slug}`}>
                          <Button
                            size="sm"
                            variant="primary"
                            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                            className="w-full sm:w-auto font-semibold"
                          >
                            View Challenge
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TABS (All, Active, Upcoming, Completed) */}
        {/* ========================================================================= */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(["All", "Active", "Upcoming", "Completed"] as const).map((tab) => {
              const isSelected = selectedTab === tab;
              const count = statusCounts[tab];

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all cursor-pointer select-none whitespace-nowrap ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span>{tab} Challenges</span>
                  {count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        isSelected
                          ? "bg-emerald-500/25 text-emerald-200 font-bold"
                          : "bg-white/[0.06] text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Clear Button (if filters active) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. SEARCH & FILTER CONTROLS BAR */}
        {/* ========================================================================= */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Search Input (Takes 5 columns on desktop) */}
            <div className="lg:col-span-5 relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="challenge-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description, or tech (e.g. Next.js)..."
                className="w-full h-11 pl-10 pr-20 bg-[#111726] border border-white/[0.1] rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors shadow-inner"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] border border-white/[0.1] rounded">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Filter Dropdowns Grid (Takes 7 columns on desktop) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsDifficultyOpen(false);
                    setIsStatusOpen(false);
                    setIsSortOpen(false);
                  }}
                  className={`w-full h-11 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between gap-1.5 transition-all bg-[#111726] cursor-pointer ${
                    selectedCategory !== "All"
                      ? "border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "border-white/[0.1] text-slate-300 hover:border-white/[0.2] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400 shrink-0">Category:</span>
                    <span className="font-semibold truncate">{selectedCategory}</span>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${
                      isCategoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCategoryOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCategoryOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-56 rounded-xl border border-white/[0.12] bg-[#111726] shadow-2xl z-50 py-1 max-h-72 overflow-y-auto animate-modal-in">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                        Select Category
                      </div>
                      {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-300 font-semibold"
                                : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                            }`}
                          >
                            <span className="truncate">{cat}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                              {categoryCounts[cat] || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Difficulty Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsDifficultyOpen(!isDifficultyOpen);
                    setIsCategoryOpen(false);
                    setIsStatusOpen(false);
                    setIsSortOpen(false);
                  }}
                  className={`w-full h-11 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between gap-1.5 transition-all bg-[#111726] cursor-pointer ${
                    selectedDifficulty !== "All"
                      ? "border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "border-white/[0.1] text-slate-300 hover:border-white/[0.2] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400 shrink-0">Difficulty:</span>
                    <span className="font-semibold truncate">{selectedDifficulty}</span>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${
                      isDifficultyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDifficultyOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDifficultyOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-48 rounded-xl border border-white/[0.12] bg-[#111726] shadow-2xl z-50 py-1 animate-modal-in">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                        Filter by Difficulty
                      </div>
                      {DIFFICULTIES.map((diff) => {
                        const isSelected = selectedDifficulty === diff;
                        return (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => {
                              setSelectedDifficulty(diff);
                              setIsDifficultyOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-300 font-semibold"
                                : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                            }`}
                          >
                            <span>{diff}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                              {difficultyCounts[diff] || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusOpen(!isStatusOpen);
                    setIsCategoryOpen(false);
                    setIsDifficultyOpen(false);
                    setIsSortOpen(false);
                  }}
                  className={`w-full h-11 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between gap-1.5 transition-all bg-[#111726] cursor-pointer ${
                    selectedStatus !== "All"
                      ? "border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "border-white/[0.1] text-slate-300 hover:border-white/[0.2] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400 shrink-0">Status:</span>
                    <span className="font-semibold truncate">{selectedStatus}</span>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${
                      isStatusOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isStatusOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsStatusOpen(false)}
                    />
                    <div className="absolute left-0 mt-1.5 w-48 rounded-xl border border-white/[0.12] bg-[#111726] shadow-2xl z-50 py-1 animate-modal-in">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                        Filter by Status
                      </div>
                      {STATUSES.map((st) => {
                        const isSelected = selectedStatus === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              handleStatusChange(st);
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-300 font-semibold"
                                : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                            }`}
                          >
                            <span>{st}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                              {statusCounts[st] || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsSortOpen(!isSortOpen);
                    setIsCategoryOpen(false);
                    setIsDifficultyOpen(false);
                    setIsStatusOpen(false);
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-white/[0.1] text-xs font-mono font-medium flex items-center justify-between gap-1.5 transition-all bg-[#111726] text-slate-300 hover:border-white/[0.2] hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold truncate">
                      {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${
                      isSortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isSortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-white/[0.12] bg-[#111726] shadow-2xl z-50 py-1 animate-modal-in">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                        Sort Challenges By
                      </div>
                      {SORT_OPTIONS.map((opt) => {
                        const isSelected = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSortBy(opt.value);
                              setIsSortOpen(false);
                            }}
                            className={`w-full flex flex-col px-3 py-2 text-xs font-mono text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                            }`}
                          >
                            <span className="font-semibold">{opt.label}</span>
                            <span className="text-[10px] text-slate-400">{opt.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" />
                Active filters:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-slate-200">
                  <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-rose-400 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                  <span>Category: {selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="hover:text-rose-400 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedDifficulty !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300">
                  <span>Difficulty: {selectedDifficulty}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDifficulty("All")}
                    className="hover:text-rose-400 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedStatus !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono text-indigo-300">
                  <span>Status: {selectedStatus}</span>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("All")}
                    className="hover:text-rose-400 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {sortBy !== "recommended" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                  <span>Sorted by: {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}</span>
                  <button
                    type="button"
                    onClick={() => setSortBy("recommended")}
                    className="hover:text-rose-400 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 underline underline-offset-2 ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. RESULTS HEADER */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-slate-400">
              Showing{" "}
              <span className="text-white font-bold font-mono-num">
                {sortedChallenges.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-300 font-mono-num">{challenges.length}</span>{" "}
              challenges
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. CHALLENGES GRID */}
        {/* ========================================================================= */}
        {sortedChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedChallenges.map((challenge) => {
              const userStatus = getChallengeStatus(challenge.id);
              const deadlineInfo = getDaysRemaining(challenge.deadline);

              return (
                <Card
                  key={challenge.id}
                  className="flex flex-col justify-between group hover:border-white/[0.18] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 bg-[#111726]/90 backdrop-blur-sm"
                >
                  <div className="p-5 sm:p-6">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
                        {getCategoryIcon(challenge.category)}
                        <span>{challenge.category}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {userStatus !== "Active" ? (
                          <StatusBadge status={userStatus} size="sm" />
                        ) : (
                          <StatusBadge status={challenge.status} size="sm" />
                        )}
                      </div>
                    </div>

                    {/* Challenge Title */}
                    <Link
                      href={`/challenges/${challenge.slug}`}
                      className="block group/title"
                    >
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover/title:text-emerald-400 transition-colors">
                        {challenge.title}
                      </h3>
                    </Link>

                    {/* Short Description */}
                    <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {challenge.shortDescription}
                    </p>

                    {/* Technologies Tag Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {challenge.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] border border-white/[0.06] text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {challenge.technologies.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/[0.02] border border-white/[0.04] text-slate-500">
                          +{challenge.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Meta & Action */}
                  <div className="p-5 sm:p-6 pt-0">
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono mb-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                      </div>

                      <div className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                        <span>{challenge.points} XP</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-4 px-0.5">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span>{challenge.participants} joined</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock
                          className={`h-3.5 w-3.5 ${
                            deadlineInfo.isUrgent ? "text-amber-400" : "text-slate-500"
                          }`}
                        />
                        <span className={deadlineInfo.isUrgent ? "text-amber-300 font-medium" : ""}>
                          {deadlineInfo.text}
                        </span>
                      </div>
                    </div>

                    <Link href={`/challenges/${challenge.slug}`} className="block w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        className="w-full text-xs font-mono hover:border-emerald-500/40 hover:text-emerald-300"
                      >
                        View Challenge
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* 7. EMPTY STATE */
          /* ========================================================================= */
          <div className="py-12">
            <EmptyState
              icon={Filter}
              title="No challenges found"
              description="No challenges match your current search criteria or active filters. Try resetting the filters or modifying your search keywords."
              action={{
                label: "Clear Filters",
                onClick: handleClearFilters,
                icon: <RotateCcw className="h-4 w-4" />,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
