"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChallenges } from "@/context/ChallengeContext";
import {
  GitBranch,
  Trophy,
  Flame,
  LayoutDashboard,
  Code2,
  User,
  RotateCcw,
  Menu,
  X,
  ExternalLink,
  Award,
  TrendingUp,
} from "lucide-react";
import { Avatar, Badge, Button, Modal } from "@/components/ui";

export function Navbar() {
  const pathname = usePathname();
  const { userProfile, resetProgress } = useChallenges();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const navLinks = [
    { href: "/challenges", label: "Challenges", icon: Code2 },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const handleReset = () => {
    resetProgress();
    setResetConfirmOpen(false);
    setProfileModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Wordmark */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400/60 transition-colors shadow-sm shadow-emerald-500/10">
                <GitBranch className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white text-base">
                    Git Club
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.2 rounded bg-white/[0.06] border border-white/[0.1] text-emerald-400">
                    CHARUSAT
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 tracking-wide font-mono -mt-0.5">
                  Challenge Arena
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-emerald-400" : "text-slate-400"
                      }`}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right: Live Gamification & Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Streak Pill */}
            <div
              title="Daily Building Streak"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium"
            >
              <Flame className="h-3.5 w-3.5 fill-amber-400/40 text-amber-400" />
              <span>{userProfile.streak}d streak</span>
            </div>

            {/* Leaderboard Rank Pill */}
            <Link
              href="/leaderboard"
              title="View Leaderboard Position"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium hover:bg-indigo-500/20 transition-colors"
            >
              <Trophy className="h-3.5 w-3.5 text-indigo-400" />
              <span>#{userProfile.rank}</span>
            </Link>

            {/* Total XP Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{userProfile.totalXp.toLocaleString()} XP</span>
            </div>

            {/* Profile Trigger Button */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2.5 pl-2.5 py-1 pr-1.5 rounded-xl border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all ml-1"
            >
              <Avatar
                src={userProfile.avatar}
                name={userProfile.name}
                size="sm"
                status="online"
              />
              <span className="text-xs font-medium text-slate-200 hidden lg:inline">
                Profile
              </span>
            </button>
          </div>

          {/* Mobile Right */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono"
            >
              {userProfile.totalXp} XP
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/[0.08] bg-[#090d16] px-4 py-4 space-y-3 animate-modal-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={userProfile.avatar}
                  name={userProfile.name}
                  size="md"
                  status="online"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{userProfile.name}</p>
                  <p className="text-xs font-mono text-slate-400">{userProfile.department}</p>
                </div>
              </div>
              <Badge variant="info" size="sm">
                Rank #{userProfile.rank}
              </Badge>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-slate-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/[0.04]"
              >
                <User className="h-4 w-4 text-slate-400" />
                Student Profile
              </button>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">{userProfile.streak} day streak</span>
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Mock State
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Student Profile Dialog */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" />
            <span>CHARUSAT Student Profile</span>
          </div>
        }
        size="md"
        footer={
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-mono"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Demo Data
            </button>
            <div className="flex items-center gap-2">
              <Link href="/profile" onClick={() => setProfileModalOpen(false)}>
                <Button size="sm" variant="primary">
                  View Full Profile
                </Button>
              </Link>
              <Button size="sm" variant="secondary" onClick={() => setProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/[0.08]">
            <Avatar
              src={userProfile.avatar}
              name={userProfile.name}
              size="lg"
              status="online"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">{userProfile.name}</h4>
                <Badge variant="default" size="sm">
                  Active Builder
                </Badge>
              </div>
              <p className="text-xs font-mono text-emerald-400 mt-0.5">
                ID: {userProfile.studentId}
              </p>
              <p className="text-xs text-slate-400">{userProfile.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#111726]/60">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Total XP Earned
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-emerald-400 font-mono-num">
                <Award className="h-4 w-4" />
                {userProfile.totalXp.toLocaleString()} XP
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#111726]/60">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Leaderboard Rank
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-indigo-400 font-mono-num">
                <Trophy className="h-4 w-4" />
                Rank #{userProfile.rank}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#111726]/60">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Solved Challenges
              </span>
              <div className="mt-1 text-lg font-bold text-white font-mono-num">
                {userProfile.solvedChallengesCount} Projects
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#111726]/60">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Current Streak
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-amber-400 font-mono-num">
                <Flame className="h-4 w-4 fill-amber-400/40 text-amber-400" />
                {userProfile.streak} Days
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-slate-900/40 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Club Affiliation</span>
              <span className="text-emerald-400">Git Club CHARUSAT Member</span>
            </div>
            <p>
              Your challenge submissions and achievements are recorded in your local browser workspace for the challenge demonstration.
            </p>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Dialog */}
      <Modal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset Prototype State?"
        description="This will restore all challenge states, submissions, and leaderboard XP to initial values."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReset}>
              Reset State
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-400 leading-relaxed">
          Useful for testing the full lifecycle (starting a challenge, submitting code, watching XP animate and ranking adjust).
        </p>
      </Modal>
    </>
  );
}
