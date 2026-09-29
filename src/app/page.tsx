"use client";

import React, { useState, useMemo } from "react";
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
  SearchInput,
  FilterDropdown,
  EmptyState,
  useToast,
} from "@/components/ui";
import {
  Code2,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Layers,
  Award,
  Terminal,
  Trophy,
  Flame,
  Zap,
  Check,
  FolderGit2,
  Brain,
  Smartphone,
  Palette,
  Shield,
  Radio,
} from "lucide-react";
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

export default function ChallengeArenaPage() {
  const { challenges, getChallengeStatus, startChallenge, userProfile } = useChallenges();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const categories: ChallengeCategory[] = [
    "Web Development",
    "AI / ML",
    "App Development",
    "UI/UX",
    "Cybersecurity",
    "IoT",
  ];

  const categoryOptions = [
    { label: "All Categories", value: "All", count: challenges.length },
    ...categories.map((cat) => ({
      label: cat,
      value: cat,
      count: challenges.filter((c) => c.category === cat).length,
    })),
  ];

  const difficultyOptions = [
    { label: "All Difficulties", value: "All" },
    { label: "Easy", value: "Easy" },
    { label: "Medium", value: "Medium" },
    { label: "Hard", value: "Hard" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "All" },
    { label: "Active", value: "Active" },
    { label: "Upcoming", value: "Upcoming" },
    { label: "Completed", value: "Completed" },
  ];

  // Featured flagship challenge (e.g. gc-01 Campus Event & Hackathon Finder)
  const featuredChallenge = useMemo(() => {
    return challenges.find((c) => c.featured) || challenges[0];
  }, [challenges]);

  // Filtered challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      const matchesSearch =
        !searchQuery ||
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.technologies.some((tech) =>
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All" || challenge.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "All" || challenge.difficulty === selectedDifficulty;

      const studentStatus = getChallengeStatus(challenge.id);
      const matchesStatus =
        selectedStatus === "All" ||
        challenge.status === selectedStatus ||
        (selectedStatus === "Active" && studentStatus === "In Progress") ||
        (selectedStatus === "Completed" && studentStatus === "Completed");

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [challenges, searchQuery, selectedCategory, selectedDifficulty, selectedStatus, getChallengeStatus]);

  const handleStart = (e: React.MouseEvent, challengeId: string, challengeTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    startChallenge(challengeId);
    toast.success(
      "Challenge Enrolled!",
      `Started "${challengeTitle}". Requirements now tracked in your local workspace.`
    );
  };

  return (
    <div className="relative min-h-screen pb-24 pt-6 sm:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Non-card, crisp typography & stats bar) */}
        {/* ========================================================================= */}
        <section aria-labelledby="hero-heading" className="relative pb-8 border-b border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>GIT CLUB CHARUSAT</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Semester Challenge Arena V2.4</span>
              </div>

              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none">
                Learn by Building <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
                  Real Software.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Ship production-grade code for CSPIT, DEPSTAR, and CHARUSAT club tracks. Solved challenges,
                verified PRs, and active streaks earn points towards your university developer rank.
              </p>
            </div>

            {/* Quick Hero Actions & Stats */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <Link href="/progress">
                  <Button variant="secondary" size="md" className="font-mono text-xs font-semibold">
                    My Challenge Journey
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="font-bold text-xs shadow-lg shadow-emerald-500/20"
                  >
                    View Leaderboard
                  </Button>
                </Link>
              </div>

              {/* User Standing Bar */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#111726] border border-white/[0.08] text-xs font-mono">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Flame className="h-4 w-4 fill-amber-400/40" />
                  <span>{userProfile.streak}d Streak</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                  <span>{userProfile.totalXp.toLocaleString()} XP</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="text-slate-300 font-semibold">Rank #{userProfile.rank}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. FEATURED CHALLENGE SPOTLIGHT (Varying Visual Hierarchy) */}
        {/* ========================================================================= */}
        {featuredChallenge && !searchQuery && selectedCategory === "All" && (
          <section aria-labelledby="featured-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 id="featured-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Flagship Challenge Spotlight
                </h2>
              </div>
              <Badge variant="warning" size="sm">
                Featured Sprint
              </Badge>
            </div>

            {/* Non-standard Hero Spotlight Box */}
            <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-[#142033] via-[#101726] to-[#0d131f] p-6 sm:p-8 shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="space-y-4 max-w-3xl flex-1">
                  {/* Category & Status */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-slate-200 font-medium">
                      {getCategoryIcon(featuredChallenge.category)}
                      <span>{featuredChallenge.category}</span>
                    </span>
                    <DifficultyBadge difficulty={featuredChallenge.difficulty} size="sm" />
                    <StatusBadge status={getChallengeStatus(featuredChallenge.id)} size="sm" />
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 font-bold">
                      <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                      <span>+{featuredChallenge.points} XP</span>
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <div>
                    <Link
                      href={`/challenges/${featuredChallenge.slug}`}
                      className="text-2xl sm:text-3xl font-extrabold text-white hover:text-emerald-400 transition-colors inline-block tracking-tight"
                    >
                      {featuredChallenge.title}
                    </Link>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {featuredChallenge.description}
                    </p>
                  </div>

                  {/* Technology Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold mr-1">Stack:</span>
                    {featuredChallenge.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Callout Action */}
                <div className="shrink-0 lg:w-64 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-6 lg:pt-0 lg:pl-8 space-y-4">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Completion Rate</span>
                      <span className="text-emerald-400 font-bold">{featuredChallenge.completionRate}%</span>
                    </div>
                    <ProgressBar value={featuredChallenge.completionRate} size="sm" variant="emerald" showPercentage={false} />
                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <span>Enrolled Builders</span>
                      <span className="text-slate-200 font-bold">{featuredChallenge.participants}</span>
                    </div>
                  </div>

                  <Link href={`/challenges/${featuredChallenge.slug}`} className="w-full inline-block">
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      className="w-full font-bold shadow-lg shadow-emerald-500/20"
                    >
                      Inspect Challenge Brief
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 3. FILTER & SEARCH TOOLBAR */}
        {/* ========================================================================= */}
        <section aria-labelledby="catalog-heading" className="space-y-4 pt-2">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Code2 className="h-4 w-4" />
              </div>
              <h2 id="catalog-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                All Challenge Tracks
              </h2>
              <span className="text-xs font-mono text-slate-400">
                ({filteredChallenges.length} Available)
              </span>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <FilterDropdown
                label="Category"
                value={selectedCategory}
                options={categoryOptions}
                onChange={setSelectedCategory}
                icon={<Layers className="h-3.5 w-3.5" />}
              />
              <FilterDropdown
                label="Difficulty"
                value={selectedDifficulty}
                options={difficultyOptions}
                onChange={setSelectedDifficulty}
              />
              <FilterDropdown
                label="Status"
                value={selectedStatus}
                options={statusOptions}
                onChange={setSelectedStatus}
                icon={<Filter className="h-3.5 w-3.5" />}
              />
            </div>
          </div>

          {/* Search Bar & Category Quick Pills */}
          <div className="space-y-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search challenges by title, technology stack (e.g. Next.js, LLM, PyTorch), or category..."
            />

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 hidden sm:inline">
                Tracks:
              </span>
              {categoryOptions.map((opt) => {
                const isSelected = selectedCategory === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedCategory(opt.value)}
                    className={`text-xs font-mono px-3 py-1 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
                        : "border-white/[0.08] bg-[#111726]/60 text-slate-400 hover:text-slate-200 hover:border-white/[0.14]"
                    }`}
                  >
                    {opt.label} ({opt.count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. CHALLENGE CARDS GRID */}
          {/* ========================================================================= */}
          {filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredChallenges.map((challenge) => {
                const studentStatus = getChallengeStatus(challenge.id);
                const isCompleted = studentStatus === "Completed";
                const isInProgress = studentStatus === "In Progress";

                return (
                  <Card
                    key={challenge.id}
                    hoverEffect
                    className="flex flex-col justify-between border-white/[0.08] bg-[#111726]/90 hover:border-white/[0.18] transition-all"
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
                          <StatusBadge
                            status={isInProgress ? "In Progress" : isCompleted ? "Completed" : challenge.status}
                            size="sm"
                          />
                        </div>

                        <CardTitle className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {challenge.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1.5 text-xs text-slate-400">
                          {challenge.shortDescription}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Technologies Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {challenge.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-white/[0.06] text-slate-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Meta stats bar */}
                        <div className="pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center text-xs font-mono">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase">Points</span>
                            <span className="font-semibold text-emerald-400 font-mono-num">
                              +{challenge.points} XP
                            </span>
                          </div>
                          <div className="flex flex-col border-x border-white/[0.06]">
                            <span className="text-[10px] text-slate-500 uppercase">Duration</span>
                            <span className="font-semibold text-slate-300 font-mono-num flex items-center justify-center gap-1">
                              <Clock className="h-3 w-3 text-slate-500" />
                              {challenge.duration}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase">Builders</span>
                            <span className="font-semibold text-slate-300 font-mono-num flex items-center justify-center gap-1">
                              <Users className="h-3 w-3 text-slate-500" />
                              {challenge.participants}
                            </span>
                          </div>
                        </div>

                        {/* Completion rate progress */}
                        <ProgressBar
                          value={challenge.completionRate}
                          label="Completion Rate"
                          showPercentage
                          size="sm"
                          variant="emerald"
                        />
                      </CardContent>
                    </div>

                    <CardFooter className="justify-between gap-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                        <span className="text-slate-500">Deadline:</span>
                        <span>
                          {new Date(challenge.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {studentStatus === "Active" && challenge.status === "Active" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => handleStart(e, challenge.id, challenge.title)}
                            className="text-xs font-mono"
                          >
                            Enroll
                          </Button>
                        ) : null}

                        <Link href={`/challenges/${challenge.slug || challenge.id}`}>
                          <Button
                            size="sm"
                            variant={isCompleted ? "outline" : isInProgress ? "primary" : "secondary"}
                            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                            className="text-xs font-bold"
                          >
                            {isCompleted ? "Review" : isInProgress ? "Continue" : "Details"}
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No challenges matched your filter"
              description="Try selecting a different category or difficulty, or clear your search query to explore all available university challenges."
              action={{
                label: "Reset Search & Filters",
                onClick: () => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSelectedStatus("All");
                },
              }}
            />
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. BORDERLESS COMMUNITY PIPELINE SECTION (Varying Visual Layout) */}
        {/* ========================================================================= */}
        <section aria-labelledby="pipeline-heading" className="pt-6 border-t border-white/[0.08]">
          <div className="text-center space-y-2 max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              How Arena Works
            </span>
            <h2 id="pipeline-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              4 Steps to Earn Credentials
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              From claiming the project brief to deploying live URLs and climbing the leaderboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Claim Brief",
                desc: "Explore challenges across Web, AI, Security, and IoT tracks. Enroll to initiate tracking.",
              },
              {
                step: "02",
                title: "Build & Commit",
                desc: "Implement features locally or on cloud IDEs with TypeScript, Next.js, or Python.",
              },
              {
                step: "03",
                title: "Submit PR & Demo",
                desc: "Dispatch public GitHub repository URL and live deployment link to the evaluator queue.",
              },
              {
                step: "04",
                title: "Earn XP & Rank",
                desc: "CI automated checks and mentor review verify code. Earn XP, streak bonuses, and badges.",
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 relative"
              >
                <span className="font-mono text-xl font-black text-emerald-400 block">{st.step}.</span>
                <h3 className="font-bold text-base text-white">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
