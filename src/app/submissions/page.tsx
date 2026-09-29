"use client";

import React from "react";
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
  PageHeader,
} from "@/components/ui";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  ArrowRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Github } from "@/components/icons/Github";
import { SAMPLE_SUBMISSIONS } from "@/data/submissions";

export default function SubmissionsPage() {
  const { submissions, userProfile, challenges } = useChallenges();

  // Combined submissions for user
  const userSubmissions = Object.values(submissions);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <PageHeader
        backLink={{ href: "/dashboard", label: "Back to Dashboard" }}
        badge={<Badge variant="default" size="sm">YOUR PORTFOLIO</Badge>}
        title="Project Submissions"
        description="All code challenges and project submissions verified in your local Git Club workspace."
        action={
          <Link href="/">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Explore More Challenges
            </Button>
          </Link>
        }
        stats={[
          {
            label: "Total Submissions",
            value: userSubmissions.length,
            icon: <CheckCircle2 className="h-4 w-4" />,
          },
          {
            label: "Total Earned XP",
            value: `${userProfile.xp} XP`,
            icon: <Sparkles className="h-4 w-4" />,
          },
        ]}
      />

      <div className="space-y-4">
        {userSubmissions.map((sub) => {
          const targetChallenge = challenges.find((c) => c.id === sub.challengeId);
          return (
            <Card key={sub.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      {sub.status}
                    </Badge>
                    {sub.score && (
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        Score: {sub.score}/100
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {sub.projectName}
                  </h3>

                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    {sub.description}
                  </p>

                  {sub.reviewerFeedback && (
                    <p className="text-xs text-slate-300 italic p-3 rounded-lg bg-slate-900/60 border border-white/[0.06]">
                      Reviewer: "{sub.reviewerFeedback}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    {sub.githubUrl && (
                      <a
                        href={sub.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
                        title="GitHub Repository"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {sub.demoUrl && (
                      <a
                        href={sub.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-white/[0.08] transition-colors"
                        title="Live Demo"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <Link href={`/challenges/${sub.challengeId}`}>
                    <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      View Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
