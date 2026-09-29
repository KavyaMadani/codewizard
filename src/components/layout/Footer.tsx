import React from "react";
import Link from "next/link";
import { GitBranch, Terminal, ShieldCheck, Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#070a12] text-slate-400 text-xs py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/[0.06]">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <GitBranch className="h-4 w-4" />
              </div>
              <span className="font-bold text-white tracking-tight text-sm">
                Git Club CHARUSAT
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.4
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Charotar University of Science and Technology (CHARUSAT), Changa.
              Empowering student developers across CSPIT, DEPSTAR, and RPCP to build production-grade software, contribute to open source, and master modern stacks.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>All Challenge Arena Systems Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Tracks & Labs
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/?track=Frontend" className="hover:text-emerald-400 transition-colors">
                  Frontend & Interface Design
                </Link>
              </li>
              <li>
                <Link href="/?track=Fullstack" className="hover:text-emerald-400 transition-colors">
                  Fullstack & Distributed Systems
                </Link>
              </li>
              <li>
                <Link href="/?track=DevOps%20%26%20Cloud" className="hover:text-emerald-400 transition-colors">
                  DevOps, Cloud & CI/CD
                </Link>
              </li>
              <li>
                <Link href="/?track=AI%20%26%20Web" className="hover:text-emerald-400 transition-colors">
                  AI Engineering & Local LLMs
                </Link>
              </li>
              <li>
                <Link href="/?track=Systems%20%26%20CLI" className="hover:text-emerald-400 transition-colors">
                  Systems, Kernel & CLI
                </Link>
              </li>
            </ul>
          </div>

          {/* CHARUSAT Network */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Campus Ecosystem
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://charusat.ac.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  CHARUSAT University Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  GitHub Student Developer Pack <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-200 transition-colors">
                  Git Club Core Mentors
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-slate-200 transition-colors">
                  Semester Hall of Fame
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} Git Club CHARUSAT. Designed & built for the Website Challenge.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Terminal className="h-3 w-3 text-emerald-400" />
              <span>Built by Students, for Students</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              <span>Honor Code Protected</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
