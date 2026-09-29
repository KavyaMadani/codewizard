import { LeaderboardUser } from "@/types";
import { SAMPLE_PARTICIPANTS } from "./participants";

export const SAMPLE_LEADERBOARD: LeaderboardUser[] = SAMPLE_PARTICIPANTS.map((participant) => ({
  ...participant,
  studentName: participant.name,
  department: participant.branch,
  primaryTrack: participant.badges[0]?.category || "General",
  badge: participant.badges[0]?.name || "Active Builder",
  solvedCount: participant.challengesCompleted,
  streakDays: participant.currentStreak,
}));
