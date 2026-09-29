"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "building" | "offline";
  className?: string;
}

export function Avatar({
  src,
  alt = "User avatar",
  name,
  size = "md",
  status,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName?: string) => {
    if (!fullName) return "GC";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };

  const statusPips = {
    online: "bg-emerald-400 ring-2 ring-[#0b0f17]",
    building: "bg-amber-400 ring-2 ring-[#0b0f17]",
    offline: "bg-slate-500 ring-2 ring-[#0b0f17]",
  };

  const pipSizes = {
    xs: "h-1.5 w-1.5 bottom-0 right-0",
    sm: "h-2 w-2 bottom-0 right-0",
    md: "h-2.5 w-2.5 bottom-0 right-0",
    lg: "h-3 w-3 bottom-0.5 right-0.5",
    xl: "h-3.5 w-3.5 bottom-1 right-1",
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-full border border-white/[0.12] bg-slate-800 flex items-center justify-center font-mono font-medium text-slate-300 select-none",
          sizes[size]
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name || alt)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute rounded-full",
            statusPips[status],
            pipSizes[size]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
