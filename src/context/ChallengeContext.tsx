"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Challenge, ChallengeStatus, SubmissionStatus, LeaderboardUser, Submission, UserProfile, Badge } from "@/types";
import { SAMPLE_CHALLENGES } from "@/data/challenges";
import { SAMPLE_LEADERBOARD } from "@/data/leaderboard";
import { CURRENT_USER } from "@/data/currentUser";
import { SAMPLE_SUBMISSIONS } from "@/data/submissions";
import { SAMPLE_BADGES } from "@/data/badges";
import { CompletionCelebrationModal } from "@/components/gamification/CompletionCelebrationModal";

interface ChallengeContextType {
  challenges: Challenge[];
  activeChallengeIds: string[];
  submissions: Record<string, Submission>;
  userProfile: UserProfile;
  leaderboard: LeaderboardUser[];
  startChallenge: (challengeId: string) => void;
  submitProject: (
    challengeId: string,
    submissionData: {
      githubUrl: string;
      liveDemoUrl?: string;
      projectName?: string;
      description: string;
      status?: SubmissionStatus;
    }
  ) => Promise<Submission>;
  completeChallenge: (challengeId: string) => Promise<Submission>;
  triggerCelebration: (data: { challengeTitle: string; xpEarned?: number; badgeUnlocked?: Badge }) => void;
  closeCelebration: () => void;
  getChallengeStatus: (challengeId: string) => ChallengeStatus;
  getSubmission: (challengeId: string) => Submission | undefined;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  resetProgress: () => void;
}

const STORAGE_KEY_ACTIVE = "gitclub_active_challenges_v2";
const STORAGE_KEY_SUBMISSIONS = "gitclub_submissions_v2";
const STORAGE_KEY_PROFILE = "gitclub_user_profile_v2";

// Seed initial submissions map from mock data
const INITIAL_SUBMISSIONS_MAP: Record<string, Submission> = SAMPLE_SUBMISSIONS.reduce(
  (acc, sub) => {
    // Only map current user submissions for the user's active/completed status
    if (sub.participantId === CURRENT_USER.id) {
      acc[sub.challengeId] = sub;
    }
    return acc;
  },
  {} as Record<string, Submission>
);

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export function ChallengeProvider({ children }: { children: React.ReactNode }) {
  const [challenges] = useState<Challenge[]>(SAMPLE_CHALLENGES);
  const [activeChallengeIds, setActiveChallengeIds] = useState<string[]>(["gc-01"]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(INITIAL_SUBMISSIONS_MAP);
  const [userProfile, setUserProfile] = useState<UserProfile>(CURRENT_USER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      const savedSubmissions = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);

      if (savedActive) setActiveChallengeIds(JSON.parse(savedActive));
      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeChallengeIds));
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [activeChallengeIds, submissions, userProfile, isLoaded]);

  const startChallenge = (challengeId: string) => {
    if (!activeChallengeIds.includes(challengeId)) {
      setActiveChallengeIds((prev) => [...prev, challengeId]);
      setUserProfile((prev) => ({
        ...prev,
        inProgressCount: prev.inProgressCount + 1,
      }));
    }
  };

  const submitProject = async (
    challengeId: string,
    submissionData: {
      githubUrl: string;
      liveDemoUrl?: string;
      projectName?: string;
      description: string;
      status?: SubmissionStatus;
    }
  ): Promise<Submission> => {
    const targetChallenge = challenges.find((c) => c.id === challengeId);
    const points = targetChallenge ? targetChallenge.points : 400;
    const submissionStatus: SubmissionStatus = submissionData.status || "Submitted";

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      challengeId,
      participantId: userProfile.id,
      projectName: submissionData.projectName || targetChallenge?.title || "Challenge Project",
      githubUrl: submissionData.githubUrl,
      demoUrl: submissionData.liveDemoUrl,
      description: submissionData.description,
      submittedAt: new Date().toISOString(),
      status: submissionStatus,
      score: 95,
      reviewerFeedback:
        "Automated CI validation checks passed! Clean commit structure, comprehensive requirement coverage, and responsive layout.",
    };

    setSubmissions((prev) => ({
      ...prev,
      [challengeId]: newSubmission,
    }));

    // Update active challenges & user profile
    setActiveChallengeIds((prev) => prev.filter((id) => id !== challengeId));

    setUserProfile((prev) => {
      const alreadySubmitted = !!submissions[challengeId];
      if (alreadySubmitted) return prev;

      const newTotalXp = prev.xp + points;
      const newSolved = prev.challengesCompleted + 1;
      const newInProgress = Math.max(0, prev.inProgressCount - 1);

      return {
        ...prev,
        xp: newTotalXp,
        totalXp: newTotalXp,
        challengesCompleted: newSolved,
        solvedChallengesCount: newSolved,
        inProgressCount: newInProgress,
      };
    });

    return newSubmission;
  };

  const getChallengeStatus = (challengeId: string): ChallengeStatus => {
    const submission = submissions[challengeId];
    if (submission) {
      if (submission.status === "Completed") return "Completed";
      if (submission.status === "Submitted") return "Submitted";
      if (submission.status === "Under Review") return "Under Review";
      return "In Progress";
    }
    if (activeChallengeIds.includes(challengeId)) {
      return "In Progress";
    }
    return "Active";
  };

  const getSubmission = (challengeId: string) => {
    return submissions[challengeId];
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save updated profile to localStorage:", e);
      }
      return updated;
    });
  };

  const resetProgress = () => {
    setActiveChallengeIds(["gc-01"]);
    setSubmissions(INITIAL_SUBMISSIONS_MAP);
    setUserProfile(CURRENT_USER);
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
  };

  // Dynamically compute leaderboard including current user's updated XP
  const leaderboard: LeaderboardUser[] = React.useMemo(() => {
    const list = SAMPLE_LEADERBOARD.map((user) => {
      if (user.isCurrentUser) {
        return {
          ...user,
          name: userProfile.name,
          username: userProfile.username,
          avatar: userProfile.avatar,
          branch: userProfile.branch,
          year: userProfile.year,
          xp: userProfile.xp,
          solvedCount: userProfile.challengesCompleted,
          streakDays: userProfile.currentStreak,
        };
      }
      return user;
    });

    // Sort by XP descending
    list.sort((a, b) => b.xp - a.xp);

    // Re-assign ranks
    return list.map((user, idx) => {
      const updated = { ...user, rank: idx + 1 };
      if (user.isCurrentUser && userProfile.rank !== idx + 1) {
        setTimeout(() => {
          setUserProfile((p) => ({ ...p, rank: idx + 1 }));
        }, 0);
      }
      return updated;
    });
  }, [userProfile.xp, userProfile.challengesCompleted, userProfile.currentStreak, userProfile.rank, userProfile.name, userProfile.username, userProfile.avatar, userProfile.branch, userProfile.year]);

  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    challengeTitle: string;
    xpEarned: number;
    badgeUnlocked?: Badge;
  } | null>(null);

  const triggerCelebration = (data: {
    challengeTitle: string;
    xpEarned?: number;
    badgeUnlocked?: Badge;
  }) => {
    setCelebrationData({
      isOpen: true,
      challengeTitle: data.challengeTitle,
      xpEarned: data.xpEarned ?? 500,
      badgeUnlocked: data.badgeUnlocked,
    });
  };

  const closeCelebration = () => {
    setCelebrationData(null);
  };

  const completeChallenge = async (challengeId: string): Promise<Submission> => {
    const targetChallenge = challenges.find((c) => c.id === challengeId);
    const challengeTitle = targetChallenge?.title || "Challenge Project";
    const xpPoints = 500; // Exact +500 XP per requirement

    // Next badge to unlock
    const currentBadgeIds = userProfile.badges.map((b) => b.id);
    const unearnedBadges = SAMPLE_BADGES.filter((b) => !currentBadgeIds.includes(b.id));
    const nextBadge: Badge = unearnedBadges[0] || SAMPLE_BADGES[1] || {
      id: "badge-builder",
      name: "Builder",
      emoji: "🚀",
      description: "Shipped and deployed full-stack campus applications with live production demos.",
      icon: "Rocket",
      category: "Specialty",
      unlockedAt: new Date().toISOString(),
    };

    const completedBadge: Badge = {
      ...nextBadge,
      unlockedAt: new Date().toISOString(),
    };

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      challengeId,
      participantId: userProfile.id,
      projectName: submissions[challengeId]?.projectName || targetChallenge?.title || "Challenge Project",
      githubUrl: submissions[challengeId]?.githubUrl || "https://github.com/kavyapatel/campus-event-finder",
      demoUrl: submissions[challengeId]?.demoUrl || "https://events-radar.vercel.app",
      description: submissions[challengeId]?.description || "Verified implementation completed with full test coverage.",
      submittedAt: new Date().toISOString(),
      status: "Completed",
      score: 98,
      reviewerFeedback: "Automated test suite passed with 100% assertion coverage. Production ready!",
    };

    setSubmissions((prev) => ({
      ...prev,
      [challengeId]: newSubmission,
    }));

    setActiveChallengeIds((prev) => prev.filter((id) => id !== challengeId));

    setUserProfile((prev) => {
      const newTotalXp = prev.totalXp + xpPoints;
      const newSolved = prev.challengesCompleted + 1;
      const newInProgress = Math.max(0, prev.inProgressCount - 1);
      const newBadges = prev.badges.some((b) => b.id === completedBadge.id)
        ? prev.badges
        : [...prev.badges, completedBadge];

      const updated = {
        ...prev,
        xp: newTotalXp,
        totalXp: newTotalXp,
        challengesCompleted: newSolved,
        solvedChallengesCount: newSolved,
        inProgressCount: newInProgress,
        badges: newBadges,
      };

      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save updated profile to localStorage:", e);
      }

      return updated;
    });

    // Trigger celebration modal
    triggerCelebration({
      challengeTitle,
      xpEarned: xpPoints,
      badgeUnlocked: completedBadge,
    });

    return newSubmission;
  };

  return (
    <ChallengeContext.Provider
      value={{
        challenges,
        activeChallengeIds,
        submissions,
        userProfile,
        leaderboard,
        startChallenge,
        submitProject,
        completeChallenge,
        triggerCelebration,
        closeCelebration,
        getChallengeStatus,
        getSubmission,
        updateUserProfile,
        resetProgress,
      }}
    >
      {children}
      {celebrationData && (
        <CompletionCelebrationModal
          isOpen={celebrationData.isOpen}
          onClose={closeCelebration}
          challengeTitle={celebrationData.challengeTitle}
          xpEarned={celebrationData.xpEarned}
          badgeUnlocked={celebrationData.badgeUnlocked}
          totalXp={userProfile.totalXp}
          currentStreak={userProfile.streak}
        />
      )}
    </ChallengeContext.Provider>
  );
}

export function useChallenges() {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error("useChallenges must be used within a ChallengeProvider");
  }
  return context;
}
