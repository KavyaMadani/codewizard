import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export interface PageHeaderProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  backLink?: {
    href: string;
    label: string;
  };
  action?: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export function PageHeader({
  badge,
  title,
  description,
  backLink,
  action,
  stats,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative pb-6 sm:pb-8 border-b border-white/[0.08] mb-8",
        className
      )}
    >
      {backLink && (
        <div className="mb-4">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{backLink.label}</span>
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          {badge && <div className="flex items-center gap-2">{badge}</div>}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-3 shrink-0">{action}</div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                {stat.icon && (
                  <span className="text-emerald-400/80">{stat.icon}</span>
                )}
                <span className="text-lg font-bold text-white font-mono-num">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
