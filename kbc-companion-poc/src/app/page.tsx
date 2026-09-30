"use client";

import { Header } from "@/components/Header";
import { OnboardingForm } from "@/components/OnboardingForm";
import {
  BudgetOverview,
  SpendingAlertBanner,
} from "@/components/BudgetOverview";
import {
  CategoryBreakdown,
  TransactionFeed,
  TripBudgetCard,
} from "@/components/DashboardPanels";
import { AICompanion } from "@/components/AICompanion";
import { DemoControls } from "@/components/DemoControls";
import { useApp } from "@/context/AppContext";
import { Plane } from "lucide-react";

export default function HomePage() {
  const { profile, chatOpen, simulateFlightPurchase, setDemoPanelOpen } =
    useApp();

  return (
    <div className="bg-grid min-h-dvh">
      <Header />

      <main
        className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 ${
          chatOpen ? "sm:pr-[420px]" : ""
        }`}
      >
        {/* Hero — brand-first composition */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-kbc-ink px-6 py-10 text-white sm:px-10 sm:py-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 85% 20%, rgba(0,156,58,0.55), transparent 55%), radial-gradient(ellipse 50% 60% at 10% 90%, rgba(26,107,138,0.35), transparent 50%)",
            }}
          />
          <div className="relative max-w-2xl animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-kbc-green-mid">
              KBC · AI-first banking
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              Companion
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
              Proactive guidance for 2.3M+ customers — personalized budgets,
              empathic alerts, and trip-ready sub-budgets at the exact right
              moment.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDemoPanelOpen(true)}
                className="rounded-lg bg-kbc-green px-5 py-2.5 text-sm font-medium text-white transition hover:bg-kbc-green-mid"
              >
                Open demo profiles
              </button>
              {profile.onboarded && (
                <button
                  type="button"
                  onClick={() => simulateFlightPurchase(0)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Plane className="h-4 w-4" />
                  Simulate flight purchase
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="space-y-5">
          <SpendingAlertBanner />
          <OnboardingForm />
          <BudgetOverview />
          <TripBudgetCard />

          {profile.onboarded && (
            <div className="grid gap-5 lg:grid-cols-2">
              <CategoryBreakdown />
              <TransactionFeed />
            </div>
          )}

          {!profile.onboarded && (
            <p className="text-center text-sm text-kbc-slate">
              Complete onboarding or load a demo profile to unlock the full
              dashboard.
            </p>
          )}
        </div>
      </main>

      <AICompanion />
      <DemoControls />
    </div>
  );
}
