"use client";

import React from "react";
import { ChallengeProvider } from "@/context/ChallengeContext";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ChallengeProvider>{children}</ChallengeProvider>
    </ToastProvider>
  );
}
