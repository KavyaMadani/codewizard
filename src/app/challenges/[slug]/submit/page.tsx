"use client";

import React, { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  EmptyState,
  useToast,
} from "@/components/ui";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Flame,
  FolderGit2,
  Globe,
  Image as ImageIcon,
  Layers,
  Play,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  UploadCloud,
  Users,
  X,
  Zap,
  AlertCircle,
  Plus,
  Check,
} from "lucide-react";
import { Github } from "@/components/icons/Github";
import confetti from "canvas-confetti";

export default function ChallengeSubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;
  const router = useRouter();

  const {
    challenges,
    getChallengeStatus,
    getSubmission,
    startChallenge,
    submitProject,
  } = useChallenges();
  const toast = useToast();

  // Find target challenge by slug or id
  const challenge = useMemo(() => {
    return challenges.find(
      (c) =>
        c.slug === slug ||
        c.id === slug ||
        c.slug?.toLowerCase() === slug.toLowerCase() ||
        c.id.toLowerCase() === slug.toLowerCase()
    );
  }, [challenges, slug]);

  // Form Fields State
  const [projectName, setProjectName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [customTechInput, setCustomTechInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    projectName: string;
    githubUrl: string;
    demoUrl?: string;
    submittedAt: string;
    points: number;
    technologies: string[];
  } | null>(null);

  // Validation Error State
  const [errors, setErrors] = useState<{
    projectName?: string;
    githubUrl?: string;
    demoUrl?: string;
    description?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize and load saved draft or pre-populated defaults
  useEffect(() => {
    if (!challenge) return;

    // Prepopulate tech stack from challenge
    if (challenge.technologies && selectedTechs.length === 0) {
      setSelectedTechs(challenge.technologies);
    }

    if (!projectName) {
      setProjectName(`${challenge.title} - Solution`);
    }

    // Try to load saved draft from localStorage
    try {
      const draftKey = `gitclub_draft_${challenge.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.projectName) setProjectName(draft.projectName);
        if (draft.githubUrl) setGithubUrl(draft.githubUrl);
        if (draft.demoUrl) setDemoUrl(draft.demoUrl);
        if (draft.description) setDescription(draft.description);
        if (draft.selectedTechs && draft.selectedTechs.length > 0) {
          setSelectedTechs(draft.selectedTechs);
        }
        if (draft.previewImage) setPreviewImage(draft.previewImage);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [challenge]);

  // Validate single field or whole form
  const validateField = (field: string, value: string): string | undefined => {
    if (field === "projectName") {
      if (!value.trim()) return "Project name is required.";
      if (value.trim().length < 3) return "Project name must be at least 3 characters.";
    }

    if (field === "githubUrl") {
      if (!value.trim()) return "GitHub repository URL is required.";
      const gitPattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;
      const genericUrlPattern = /^https?:\/\/github\.com\/.+/i;
      if (!genericUrlPattern.test(value.trim()) && !gitPattern.test(value.trim())) {
        return "Must be a valid GitHub URL (e.g. https://github.com/username/repo).";
      }
    }

    if (field === "demoUrl") {
      if (value.trim()) {
        try {
          const url = new URL(value.trim());
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            return "Demo URL must start with http:// or https://";
          }
        } catch {
          return "Please enter a valid URL (e.g. https://my-demo.vercel.app).";
        }
      }
    }

    if (field === "description") {
      if (!value.trim()) return "Project description is required.";
      if (value.trim().length < 20) {
        return `Please provide a more detailed description (${value.trim().length}/20 min chars).`;
      }
    }

    return undefined;
  };

  // Run validation on all fields
  const validateForm = () => {
    const newErrors: typeof errors = {
      projectName: validateField("projectName", projectName),
      githubUrl: validateField("githubUrl", githubUrl),
      demoUrl: validateField("demoUrl", demoUrl),
      description: validateField("description", description),
    };

    setErrors(newErrors);
    setTouched({
      projectName: true,
      githubUrl: true,
      demoUrl: true,
      description: true,
    });

    return !Object.values(newErrors).some(Boolean);
  };

  // Field change handlers with real-time validation
  const handleFieldChange = (field: string, val: string) => {
    if (field === "projectName") setProjectName(val);
    if (field === "githubUrl") setGithubUrl(val);
    if (field === "demoUrl") setDemoUrl(val);
    if (field === "description") setDescription(val);

    if (touched[field]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val =
      field === "projectName"
        ? projectName
        : field === "githubUrl"
        ? githubUrl
        : field === "demoUrl"
        ? demoUrl
        : description;
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Add custom technology tag
  const handleAddCustomTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTechInput.trim()) return;
    const clean = customTechInput.trim();
    if (!selectedTechs.includes(clean)) {
      setSelectedTechs((prev) => [...prev, clean]);
    }
    setCustomTechInput("");
  };

  // Remove technology tag
  const handleRemoveTech = (tech: string) => {
    setSelectedTechs((prev) => prev.filter((t) => t !== tech));
  };

  // Simulated screenshot selector presets
  const handleSelectPresetThumbnail = (type: "dashboard" | "mobile" | "dark") => {
    const presets = {
      dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
      dark: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    };
    setPreviewImage(presets[type]);
    toast.info("Thumbnail Selected", "Simulated preview thumbnail attached.");
  };

  // Save Draft Action
  const handleSaveDraft = () => {
    if (!challenge) return;
    setIsSavingDraft(true);

    try {
      const draftKey = `gitclub_draft_${challenge.id}`;
      const draftData = {
        projectName,
        githubUrl,
        demoUrl,
        description,
        selectedTechs,
        previewImage,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      setTimeout(() => {
        setIsSavingDraft(false);
        toast.success(
          "Draft Saved",
          "Your progress has been saved locally. You can return anytime to finish submitting."
        );
      }, 400);
    } catch {
      setIsSavingDraft(false);
      toast.error("Error", "Could not save draft locally.");
    }
  };

  // Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (!validateForm()) {
      toast.error("Validation Error", "Please resolve highlighted form errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate realistic submission latency
      await new Promise((res) => setTimeout(res, 800));

      await submitProject(challenge.id, {
        githubUrl: githubUrl.trim(),
        liveDemoUrl: demoUrl.trim() || undefined,
        projectName: projectName.trim(),
        description: description.trim(),
        status: "Submitted",
      });

      // Clear draft
      try {
        localStorage.removeItem(`gitclub_draft_${challenge.id}`);
      } catch {
        // Ignore
      }

      // Record submitted data for success view
      setSubmittedData({
        projectName: projectName.trim(),
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim() || undefined,
        submittedAt: new Date().toISOString(),
        points: challenge.points,
        technologies: selectedTechs,
      });

      setIsSubmitting(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#10b981", "#06b6d4", "#f59e0b", "#a855f7", "#ffffff"],
      });

      toast.xp(
        challenge.points,
        `Submission received! +${challenge.points} XP accreditation recorded.`
      );
    } catch {
      setIsSubmitting(false);
      toast.error("Submission Failed", "An error occurred while submitting. Please try again.");
    }
  };

  // If Challenge Not Found (Invalid Slug)
  if (!challenge) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <EmptyState
            icon={AlertCircle}
            title="Challenge Not Found"
            description={`We couldn't locate any active challenge matching "${slug}".`}
            action={{
              label: "Return to Challenges",
              onClick: () => router.push("/challenges"),
              icon: <ArrowLeft className="h-4 w-4" />,
            }}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUCCESS SCREEN VIEW
  // =========================================================================
  if (submittedData) {
    return (
      <div className="min-h-screen pb-24 pt-8 sm:pt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#13222e] via-[#101928] to-[#0c121e] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center animate-modal-in">
            {/* Glowing orb accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            {/* Check Icon Badge */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-950/40">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              ✓ Submission Successful
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              Your project submission has been recorded in the CHARUSAT Git Club Arena. Great work bringing this build to life!
            </p>

            {/* Submission Details Card */}
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#090d16]/80 p-5 sm:p-6 text-left space-y-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Project Name
                  </span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {submittedData.projectName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status="Submitted" size="md" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Challenge
                  </span>
                  <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                    {challenge.title}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Submitted At
                  </span>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">
                    {new Date(submittedData.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    XP Available
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 font-mono-num mt-0.5">
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                    <span>+{submittedData.points} XP</span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-3">
                <a
                  href={submittedData.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>View GitHub Repo</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                {submittedData.demoUrl && (
                  <a
                    href={submittedData.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Live Demo</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href={`/challenges/${challenge.slug}`} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full sm:w-auto font-bold px-5"
                >
                  View Submission
                </Button>
              </Link>

              <Link href="/challenges" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto text-xs font-mono px-5"
                >
                  Back to Challenges
                </Button>
              </Link>

              <Link href="/leaderboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Trophy className="h-4 w-4 text-amber-400" />}
                  className="w-full sm:w-auto text-xs font-mono px-5"
                >
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUBMISSION FORM VIEW
  // =========================================================================
  return (
    <div className="relative min-h-screen pb-28 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/challenges/${challenge.slug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Challenge Details</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white hover:border-white/[0.18] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5 text-slate-400" />
              <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
            </button>
          </div>
        </div>

        {/* Page Title & Intro */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="default" size="sm">
              Challenge Submission
            </Badge>
            <span className="text-xs font-mono text-slate-400">•</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              +{challenge.points} XP Reward
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Submit Project: {challenge.title}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Provide your public GitHub repository, optional live deployment link, and key implementation notes to receive your XP and developer ranking.
          </p>
        </div>

        {/* Grid Layout (Form 8 cols + Summary Sidebar 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Submission Form (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="border-white/[0.08] bg-[#111726]/95 backdrop-blur-sm">
              <CardHeader className="border-b border-white/[0.06] pb-5">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Submission Specification</span>
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  Project Details
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ensure all required fields are filled with valid URLs before submitting.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form id="submission-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* 1. PROJECT NAME */}
                  <div>
                    <label className="block text-xs font-mono text-slate-200 mb-1.5">
                      Project Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => handleFieldChange("projectName", e.target.value)}
                      onBlur={() => handleBlur("projectName")}
                      placeholder="e.g., Campus Event & Hackathon Finder"
                      className={`w-full h-11 px-4 bg-[#090d16] border rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors ${
                        errors.projectName
                          ? "border-rose-500/60 focus:ring-1 focus:ring-rose-500/60"
                          : "border-white/[0.1] focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60"
                      }`}
                    />
                    {errors.projectName && (
                      <p className="mt-1.5 text-xs font-mono text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.projectName}</span>
                      </p>
                    )}
                  </div>

                  {/* 2. GITHUB REPOSITORY URL */}
                  <div>
                    <label className="block text-xs font-mono text-slate-200 mb-1.5">
                      GitHub Repository URL <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Github className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => handleFieldChange("githubUrl", e.target.value)}
                        onBlur={() => handleBlur("githubUrl")}
                        placeholder="https://github.com/your-username/your-repository"
                        className={`w-full h-11 pl-10 pr-4 bg-[#090d16] border rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none transition-colors ${
                          errors.githubUrl
                            ? "border-rose-500/60 focus:ring-1 focus:ring-rose-500/60"
                            : "border-white/[0.1] focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60"
                        }`}
                      />
                    </div>
                    {errors.githubUrl ? (
                      <p className="mt-1.5 text-xs font-mono text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.githubUrl}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] font-mono text-slate-500">
                        Must be a public repository containing your source code and documentation.
                      </p>
                    )}
                  </div>

                  {/* 3. LIVE DEMO URL */}
                  <div>
                    <label className="block text-xs font-mono text-slate-200 mb-1.5">
                      Live Demo URL <span className="text-slate-500">(Optional but recommended)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Globe className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="url"
                        value={demoUrl}
                        onChange={(e) => handleFieldChange("demoUrl", e.target.value)}
                        onBlur={() => handleBlur("demoUrl")}
                        placeholder="https://your-project.vercel.app or https://your-project.netlify.app"
                        className={`w-full h-11 pl-10 pr-4 bg-[#090d16] border rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none transition-colors ${
                          errors.demoUrl
                            ? "border-rose-500/60 focus:ring-1 focus:ring-rose-500/60"
                            : "border-white/[0.1] focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60"
                        }`}
                      />
                    </div>
                    {errors.demoUrl && (
                      <p className="mt-1.5 text-xs font-mono text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.demoUrl}</span>
                      </p>
                    )}
                  </div>

                  {/* 4. TECHNOLOGIES USED */}
                  <div>
                    <label className="block text-xs font-mono text-slate-200 mb-1.5">
                      Technologies & Libraries Used
                    </label>

                    {/* Chips list */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {selectedTechs.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-300"
                        >
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="p-0.5 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            title="Remove tech"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}

                      {selectedTechs.length === 0 && (
                        <span className="text-xs font-mono text-slate-500">
                          No technologies selected yet.
                        </span>
                      )}
                    </div>

                    {/* Add custom tech input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customTechInput}
                        onChange={(e) => setCustomTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomTech(e);
                          }
                        }}
                        placeholder="Add technology (e.g. Tailwind CSS, Zustand, Prisma)..."
                        className="w-full h-9 px-3.5 bg-[#090d16] border border-white/[0.08] rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddCustomTech}
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                        className="shrink-0 text-xs font-mono"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* 5. PROJECT DESCRIPTION */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono text-slate-200">
                        Project Description & Architecture Highlights <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        {description.length} chars (min 20)
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      onBlur={() => handleBlur("description")}
                      placeholder="Describe what you built, key algorithmic choices, state management approach, and how you met the challenge criteria..."
                      className={`w-full p-3.5 bg-[#090d16] border rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors leading-relaxed ${
                        errors.description
                          ? "border-rose-500/60 focus:ring-1 focus:ring-rose-500/60"
                          : "border-white/[0.1] focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60"
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-xs font-mono text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.description}</span>
                      </p>
                    )}
                  </div>

                  {/* 6. OPTIONAL SCREENSHOT / THUMBNAIL PLACEHOLDER INTERACTION */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-mono text-slate-200">
                        Screenshot / Thumbnail Preview <span className="text-slate-500">(Optional)</span>
                      </label>
                      {previewImage && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(null)}
                          className="text-xs font-mono text-rose-400 hover:text-rose-300 underline cursor-pointer"
                        >
                          Remove image
                        </button>
                      )}
                    </div>

                    {previewImage ? (
                      <div className="relative rounded-xl border border-white/[0.1] overflow-hidden group max-h-48">
                        <img
                          src={previewImage}
                          alt="Project Preview"
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white text-xs font-mono hover:bg-rose-500 transition-colors"
                          >
                            Remove Screenshot
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-white/[0.12] bg-[#090d16]/60 flex flex-col items-center justify-center text-center space-y-2">
                        <UploadCloud className="h-7 w-7 text-slate-400" />
                        <span className="text-xs font-mono text-slate-300 font-medium">
                          Simulate uploading a project showcase preview
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectPresetThumbnail("dashboard")}
                            className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors cursor-pointer"
                          >
                            + Dashboard Mockup
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectPresetThumbnail("mobile")}
                            className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors cursor-pointer"
                          >
                            + Mobile Mockup
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectPresetThumbnail("dark")}
                            className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors cursor-pointer"
                          >
                            + Terminal IDE Theme
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>

              {/* Form Action Footer */}
              <CardFooter className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  leftIcon={<Save className="h-4 w-4" />}
                  className="w-full sm:w-auto text-xs font-mono"
                >
                  {isSavingDraft ? "Saving Draft..." : "Save Draft"}
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link href={`/challenges/${challenge.slug}`} className="w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto text-xs font-mono text-slate-400"
                    >
                      Cancel
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    form="submission-form"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="h-4 w-4" />}
                    className="w-full sm:w-auto font-bold px-6 shadow-md shadow-emerald-500/20"
                  >
                    Submit Challenge
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Challenge Target Card */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Challenge Target</span>
                </div>
                <CardTitle className="text-base font-bold text-white">
                  {challenge.title}
                </CardTitle>
                <CardDescription className="text-slate-400 line-clamp-2 text-xs">
                  {challenge.shortDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between text-xs font-mono p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-400">XP Reward:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1 font-mono-num">
                    <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                    +{challenge.points} XP
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-400">Difficulty:</span>
                  <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs font-mono p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-slate-200">{challenge.category}</span>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Pre-Flight Reminders */}
            <Card className="border-white/[0.08] bg-[#111726]/90">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Pre-Submission Checklist</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Repository is set to public visibility on GitHub.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>README includes quick local installation and setup guide.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Zero TypeScript compilation errors or broken build links.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Deliverables match challenge problem statement.</span>
                </div>
              </CardContent>
            </Card>

            {/* Submission Policy Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-slate-400 space-y-2">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Instant Automated Accreditation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Submitted projects are validated against requirement schemas and automatically accredited to your profile leaderboard standing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
