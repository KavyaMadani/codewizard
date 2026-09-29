import { Submission } from "@/types";

export const SAMPLE_SUBMISSIONS: Submission[] = [
  {
    id: "sub-101",
    challengeId: "gc-04",
    participantId: "usr-04", // Current user (Kavya Patel)
    projectName: "GitScore — GitHub Developer Profile Inspector",
    githubUrl: "https://github.com/kavyapatel/git-profile-inspector",
    demoUrl: "https://gitscore.charusat.ac.in",
    description:
      "Built a developer profile visualizer utilizing GitHub REST API with custom SVG language distribution donuts and commit streak calculations. Includes fallback mock data to prevent rate-limiting and dark-theme summary card exports.",
    status: "Completed",
    submittedAt: "2026-09-12T14:20:00Z",
    score: 96,
    reviewerFeedback:
      "Outstanding implementation! Clean type safety, delightful commit heatmap visualization, and resilient offline rate-limit fallbacks.",
  },
  {
    id: "sub-102",
    challengeId: "gc-07",
    participantId: "usr-04", // Current user
    projectName: "FocusFlow Student Study Cockpit",
    githubUrl: "https://github.com/kavyapatel/focusflow-timer",
    demoUrl: "https://focusflow.vercel.app",
    description:
      "A distraction-free study terminal with dual interval Pomodoro modes, Web Audio white noise synthesis, daily XP streak multipliers, and keyboard shortcuts.",
    status: "Completed",
    submittedAt: "2026-09-18T18:45:00Z",
    score: 94,
    reviewerFeedback:
      "Web Audio generator is smooth and uses zero external sound file assets. High keyboard accessibility and accurate zero-drift timer.",
  },
  {
    id: "sub-103",
    challengeId: "gc-14",
    participantId: "usr-04", // Current user
    projectName: "CHARUSAT Dev Design System & Token Studio",
    githubUrl: "https://github.com/kavyapatel/charusat-design-tokens",
    demoUrl: "https://charusat-tokens.vercel.app",
    description:
      "Comprehensive component studio documenting button variants, input fields, badges, and card surfaces with one-click copyable Tailwind markup.",
    status: "Completed",
    submittedAt: "2026-09-22T11:30:00Z",
    score: 92,
    reviewerFeedback:
      "Crisp visual hierarchy and excellent contrast compliance. Great reusable component foundation for campus projects.",
  },
  {
    id: "sub-104",
    challengeId: "gc-01",
    participantId: "usr-04", // Current user (In Progress)
    projectName: "CHARUSAT Campus Event & Hackathon Radar",
    githubUrl: "https://github.com/kavyapatel/campus-event-finder",
    demoUrl: "https://events-radar.vercel.app",
    description:
      "Currently integrating iCal calendar sync and building the RSVP seat availability counter for CSPIT and DEPSTAR annual events.",
    status: "In Progress",
    submittedAt: "2026-09-28T09:00:00Z",
  },
  {
    id: "sub-104b",
    challengeId: "gc-02",
    participantId: "usr-04", // Current user (Submitted / Under Review)
    projectName: "PaperMind AI — Intelligent Academic Paper Companion",
    githubUrl: "https://github.com/kavyapatel/papermind-ai-assistant",
    demoUrl: "https://papermind-charusat.vercel.app",
    description:
      "Automated PDF concept extraction with localized transformer pipelines, interactive flashcards, and vector similarity search across research notes.",
    status: "Submitted",
    submittedAt: "2026-09-27T16:40:00Z",
    reviewerFeedback: "Under automated CI review: Linting passed, test suite executed successfully. Pending final mentor evaluation.",
  },
  {
    id: "sub-105",
    challengeId: "gc-01",
    participantId: "usr-01", // Aarav Sharma
    projectName: "UniEvents CHARUSAT Discovery Portal",
    githubUrl: "https://github.com/aaravsharma/unievents-charusat",
    demoUrl: "https://unievents.charusat.ac.in",
    description:
      "Full event aggregator with department filtering, seat countdown, and dynamic calendar exports with instant email ICS attachments.",
    status: "Completed",
    submittedAt: "2026-09-15T16:10:00Z",
    score: 98,
    reviewerFeedback: "Phenomenal work! Super fast rendering and immaculate code documentation.",
  },
  {
    id: "sub-106",
    challengeId: "gc-02",
    participantId: "usr-01", // Aarav Sharma
    projectName: "PaperMind — Research Paper Study Assistant",
    githubUrl: "https://github.com/aaravsharma/papermind-ai",
    demoUrl: "https://papermind.vercel.app",
    description:
      "Client-side document chunking with Ollama local inference integration and interactive spaced-repetition flashcards.",
    status: "Completed",
    submittedAt: "2026-09-20T20:30:00Z",
    score: 95,
    reviewerFeedback: "Very clean LLM prompt chaining and instant responsive layout.",
  },
  {
    id: "sub-107",
    challengeId: "gc-03",
    participantId: "usr-02", // Diya Patel
    projectName: "HostelSplit — Student Debt Settlement Hub",
    githubUrl: "https://github.com/diyacodes/hostelsplit",
    demoUrl: "https://hostelsplit.vercel.app",
    description:
      "Implements Minimum Cash Flow graph algorithm to reduce hostel mess bill splits by 65%. Generates native UPI payment deep links.",
    status: "Completed",
    submittedAt: "2026-09-14T12:00:00Z",
    score: 97,
    reviewerFeedback: "The graph settlement algorithm is clean and thoroughly unit tested. UPI deep links work seamlessly.",
  },
  {
    id: "sub-108",
    challengeId: "gc-12",
    participantId: "usr-07", // Siddharth Bhatt
    projectName: "OWASP DevSecOps Security Arena",
    githubUrl: "https://github.com/sidbhatt/devsecops-ctf",
    demoUrl: "https://security-ctf.charusat.ac.in",
    description:
      "Interactive 5-level security sandbox testing client-side secret detection, SQL injection sanitization, and CSP header generation.",
    status: "Completed",
    submittedAt: "2026-09-26T17:15:00Z",
    score: 99,
    reviewerFeedback: "Top-tier educational CTF. Very realistic vulnerabilities and clear explanatory feedback.",
  },
  {
    id: "sub-109",
    challengeId: "gc-06",
    participantId: "usr-10", // Khushi Mehta
    projectName: "Changa Weather & Agro-Tech Radar",
    githubUrl: "https://github.com/khushimehta/changa-weather-station",
    demoUrl: "https://changa-weather.vercel.app",
    description:
      "Live micro-climate weather gauges with heat index alerts and precipitation radar specifically tuned for Changa rural campus conditions.",
    status: "Completed",
    submittedAt: "2026-09-21T13:40:00Z",
    score: 93,
    reviewerFeedback: "Beautiful SVG dials and smooth real-time telemetry simulation.",
  },
  {
    id: "sub-110",
    challengeId: "gc-05",
    participantId: "usr-06", // Ananya Desai
    projectName: "Campus Lost & Found Verification Portal",
    githubUrl: "https://github.com/ananyadesai/campus-lost-found",
    demoUrl: "https://lostfound.charusat.ac.in",
    description:
      "Lost item portal with question-based ownership verification and dynamic QR collection badges for security desk collection.",
    status: "Completed",
    submittedAt: "2026-09-25T15:10:00Z",
    score: 91,
    reviewerFeedback: "Great privacy protection approach. Clean UI and great mobile responsiveness.",
  },
  {
    id: "sub-111",
    challengeId: "gc-11",
    participantId: "usr-03", // Meet Joshi
    projectName: "Git Club Merch & Swag Storefront",
    githubUrl: "https://github.com/meetjoshi/gitclub-merch",
    demoUrl: "https://swag.gitclub.charusat.ac.in",
    description:
      "Fast merchandise store featuring discount voucher codes, sliding cart, and simulated invoice receipts.",
    status: "Completed",
    submittedAt: "2026-09-24T19:00:00Z",
    score: 96,
    reviewerFeedback: "Fast page load and flawless coupon validation state.",
  },
  {
    id: "sub-112",
    challengeId: "gc-10",
    participantId: "usr-08", // Priyanshi Shah
    projectName: "CHARUSAT ERP Modern Student Portal",
    githubUrl: "https://github.com/priyanshis/charusat-erp-redesign",
    demoUrl: "https://charusat-portal-redesign.vercel.app",
    description:
      "Redesigned the university gradebook, attendance tracker, and timetable into a high-contrast dark theme with GPA prediction sliders.",
    status: "Completed",
    submittedAt: "2026-09-27T10:45:00Z",
    score: 95,
    reviewerFeedback: "Stunning transformation from the legacy ERP. Very intuitive attendance risk gauge.",
  },
];
