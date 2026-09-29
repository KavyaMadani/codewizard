"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center justify-between gap-2 h-10 px-3.5 rounded-xl border text-xs font-mono font-medium transition-all bg-[#111726]",
          isOpen
            ? "border-emerald-500/50 ring-1 ring-emerald-500/40 text-white"
            : "border-white/[0.1] text-slate-300 hover:border-white/[0.2] hover:text-white"
        )}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className="text-slate-400">{label}:</span>
          <span className="text-slate-100 font-semibold">{selectedOption?.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-56 origin-top-left rounded-xl border border-white/[0.12] bg-[#111726] shadow-xl z-50 py-1 focus:outline-none animate-modal-in">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
            Filter by {label}
          </div>
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors",
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-300 font-semibold"
                      : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <div className="flex items-center gap-2 ml-2">
                    {option.count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                        {option.count}
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
