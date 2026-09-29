import React from "react";
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Terminal,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-white/[0.12] bg-[#111726]/40",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-400 mb-4 shadow-inner">
        <Icon className="h-6 w-6 text-emerald-400/80" />
      </div>

      <h3 className="text-base font-semibold text-white tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          <Button
            size="sm"
            variant="outline"
            onClick={action.onClick}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
