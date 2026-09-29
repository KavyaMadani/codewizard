export type ChallengeCategory =
  | "Web Development"
  | "AI / ML"
  | "App Development"
  | "UI/UX"
  | "Cybersecurity"
  | "IoT";

export type ChallengeDifficulty = "Easy" | "Medium" | "Hard";

export type ChallengeLifecycleStatus = "Active" | "Upcoming" | "Completed";

export type SubmissionStatus =
  | "Not Started"
  | "In Progress"
  | "Submitted"
  | "Under Review"
  | "Completed";

// Support legacy & status aliases for flexible component consumption
export type Difficulty = ChallengeDifficulty | "Beginner" | "Intermediate" | "Advanced";
export type ChallengeStatus =
  | ChallengeLifecycleStatus
  | SubmissionStatus
  | "available"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "completed";

export type Track = ChallengeCategory;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji?: string;
  category: "Achievement" | "Streak" | "Specialty" | "Contribution";
  unlockedAt?: string;
  progress?: { current: number; total: number; label: string };
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  status: ChallengeLifecycleStatus;
  points: number; // XP points
  deadline: string;
  duration: string;
  technologies: string[];
  requirements: string[];
  rules: string[];
  deliverables: string[];
  participants: number;
  completionRate: number;
  featured: boolean;
  createdAt: string;

  // Optional convenience aliases for UI components
  xp?: number;
  track?: ChallengeCategory;
  estimatedHours?: number;
}

export interface Participant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  branch: string; // e.g., "Computer Science & Engineering (CSPIT)", "Information Technology (DEPSTAR)"
  year: "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
  xp: number;
  rank: number;
  challengesCompleted: number;
  currentStreak: number;
  badges: Badge[];
  studentId?: string; // CHARUSAT enrollment number e.g., 23IT089
  bio?: string;
  isCurrentUser?: boolean;
}

export interface Submission {
  id: string;
  challengeId: string;
  participantId: string;
  projectName: string;
  githubUrl: string;
  demoUrl?: string;
  description: string;
  status: SubmissionStatus;
  submittedAt: string;
  score?: number; // 0 - 100
  reviewerFeedback?: string;
}

// UserProfile alias for state context consumption
export interface UserProfile extends Participant {
  totalXp: number;
  streak: number;
  solvedChallengesCount: number;
  inProgressCount: number;
  department: string;
  semester: string;
}

export interface LeaderboardUser extends Participant {
  studentName: string;
  department: string;
  primaryTrack?: string;
  badge?: string;
  solvedCount?: number;
  streakDays?: number;
}
