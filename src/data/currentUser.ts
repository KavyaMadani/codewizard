import { UserProfile } from "@/types";
import { SAMPLE_BADGES } from "./badges";

export const CURRENT_USER: UserProfile = {
  id: "usr-04",
  name: "Kavya Patel",
  username: "kavyapatel",
  studentId: "23IT089",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  branch: "Information Technology (CSPIT)",
  department: "CSPIT - IT",
  semester: "6th Semester",
  year: "3rd Year",
  xp: 2200,
  totalXp: 2200,
  rank: 4,
  challengesCompleted: 4,
  solvedChallengesCount: 4,
  inProgressCount: 1,
  currentStreak: 6,
  streak: 6,
  badges: [
    { ...SAMPLE_BADGES[0], unlockedAt: "2026-09-02T10:00:00Z" },
    { ...SAMPLE_BADGES[5], unlockedAt: "2026-09-14T15:30:00Z" },
    { ...SAMPLE_BADGES[2], unlockedAt: "2026-09-24T18:45:00Z" },
  ],
  bio: "3rd-year IT student at CSPIT passionate about frontend engineering, distributed systems, and open-source campus initiatives. Building with TypeScript & Next.js.",
  isCurrentUser: true,
};
