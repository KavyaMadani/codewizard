import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Git Club Challenge Arena | CHARUSAT — Learn by Building",
  description:
    "CHARUSAT Git Club's challenge arena. Build real-world technical projects across Frontend, DevOps, AI, and Systems, submit your code, and climb the university leaderboard.",
  keywords: [
    "Git Club",
    "CHARUSAT",
    "CSPIT",
    "DEPSTAR",
    "Coding Challenges",
    "Learn by Building",
    "Developer Arena",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-grid-tech">
            <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
            <Navbar />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
