"use client";

import { useApp } from "@/context/AppContext";
import { DEMO_PRESETS } from "@/lib/mock-data";
import { Plane, Hotel, X, Users } from "lucide-react";

export function DemoControls() {
  const {
    demoPanelOpen,
    setDemoPanelOpen,
    loadPreset,
    simulateFlightPurchase,
    profile,
  } = useApp();

  if (!demoPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-kbc-ink/40 p-4 sm:items-center">
      <div
        className="absolute inset-0"
        onClick={() => setDemoPanelOpen(false)}
        aria-hidden
      />
      <div className="relative w-full max-w-lg animate-fade-up rounded-2xl bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-kbc-green">
              Pitch controls
            </p>
            <h2 className="mt-1 font-display text-2xl text-kbc-ink">
              Demo scenarios
            </h2>
            <p className="mt-1 text-sm text-kbc-slate">
              Switch life stages and trigger travel anomalies live.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setDemoPanelOpen(false)}
            className="rounded-lg p-1.5 text-kbc-slate hover:bg-kbc-mist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPreset(p.id)}
              className="flex w-full items-start gap-3 rounded-xl border border-kbc-sand px-3 py-3 text-left transition hover:border-kbc-green/40 hover:bg-kbc-green-light/60"
            >
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-kbc-green" />
              <span>
                <span className="block text-sm font-medium text-kbc-ink">
                  {p.label}
                </span>
                <span className="block text-xs text-kbc-slate">{p.description}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-kbc-sand pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kbc-slate">
            Anomaly triggers
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                simulateFlightPurchase(0);
                setDemoPanelOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-kbc-ink px-3 py-3 text-sm font-medium text-white transition hover:bg-kbc-ink/90"
            >
              <Plane className="h-4 w-4" />
              Simulate flight (Rome)
            </button>
            <button
              type="button"
              onClick={() => {
                simulateFlightPurchase(1);
                setDemoPanelOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-kbc-sand px-3 py-3 text-sm font-medium text-kbc-ink transition hover:bg-kbc-mist"
            >
              <Plane className="h-4 w-4 text-kbc-green" />
              Flight (Barcelona)
            </button>
            <button
              type="button"
              onClick={() => {
                simulateFlightPurchase(2);
                setDemoPanelOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-kbc-sand px-3 py-3 text-sm font-medium text-kbc-ink transition hover:bg-kbc-mist sm:col-span-2"
            >
              <Hotel className="h-4 w-4 text-kbc-info" />
              Simulate hotel booking
            </button>
          </div>
          {!profile.onboarded && (
            <p className="mt-3 text-xs text-kbc-alert">
              Tip: load a demo profile first so the trip intervention has full context.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
