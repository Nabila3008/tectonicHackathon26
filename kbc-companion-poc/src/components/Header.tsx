"use client";

import { useApp } from "@/context/AppContext";
import { FlaskConical, MessageSquare, RotateCcw } from "lucide-react";

export function Header() {
  const { setChatOpen, chatOpen, setDemoPanelOpen, resetAll, profile } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-kbc-sand/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kbc-green text-sm font-bold tracking-tight text-white shadow-soft">
            KBC
          </div>
          <div>
            <p className="font-display text-lg leading-tight text-kbc-ink sm:text-xl">
              Companion
            </p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-kbc-slate/70">
              Hackathon PoC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile.onboarded && (
            <p className="hidden text-sm text-kbc-slate md:block">
              {profile.fullName.split(" ")[0]}
            </p>
          )}
          <button
            type="button"
            onClick={() => setDemoPanelOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-kbc-sand bg-white px-3 py-2 text-sm text-kbc-ink transition hover:border-kbc-green/40 hover:bg-kbc-green-light"
          >
            <FlaskConical className="h-4 w-4 text-kbc-green" />
            <span className="hidden sm:inline">Demo</span>
          </button>
          <button
            type="button"
            onClick={() => setChatOpen(!chatOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-kbc-green px-3 py-2 text-sm font-medium text-white transition hover:bg-kbc-green-dark"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Assistant</span>
          </button>
          <button
            type="button"
            onClick={resetAll}
            aria-label="Reset demo"
            className="rounded-lg border border-transparent p-2 text-kbc-slate transition hover:bg-kbc-mist"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
