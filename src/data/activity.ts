export interface ActivityItem {
  id: string;
  type: "challenge_started" | "submission_made" | "badge_earned" | "challenge_completed";
  title: string;
  description: string;
  timestamp: string;
  xpAwarded?: number;
  badgeName?: string;
  challengeId?: string;
}

export const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "challenge_started",
    title: "Enrolled in Challenge",
    description: "Started working on Campus Event & Hackathon Finder.",
    timestamp: "2 hours ago",
    challengeId: "gc-01",
  },
  {
    id: "act-2",
    type: "submission_made",
    title: "Project Submitted for Review",
    description: "Submitted CHARUSAT Dev Design System & Token Studio (Score: 92/100).",
    timestamp: "1 day ago",
    xpAwarded: 300,
    challengeId: "gc-14",
  },
  {
    id: "act-3",
    type: "badge_earned",
    title: "New Badge Unlocked",
    description: "Earned the 'Streak Master' badge for 6 continuous days of building.",
    timestamp: "3 days ago",
    badgeName: "Streak Master",
  },
  {
    id: "act-4",
    type: "challenge_completed",
    title: "Challenge Completed & Verified",
    description: "Completed FocusFlow: Student Productivity & Lab Timer.",
    timestamp: "5 days ago",
    xpAwarded: 350,
    challengeId: "gc-07",
  },
  {
    id: "act-5",
    type: "challenge_completed",
    title: "Challenge Completed & Verified",
    description: "Completed GitHub Profile & Repository Analyzer with honors.",
    timestamp: "10 days ago",
    xpAwarded: 300,
    challengeId: "gc-04",
  },
];
