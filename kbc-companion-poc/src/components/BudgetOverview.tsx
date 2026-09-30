"use client";

import { useApp } from "@/context/AppContext";
import { formatEUR, formatEURPrecise, lifeStageLabel } from "@/lib/budget-engine";
import { X, AlertTriangle, Info, Siren } from "lucide-react";

export function SpendingAlertBanner() {
  const { alerts, dismissAlert, setChatOpen } = useApp();
  const alert = alerts.find((a) => !a.dismissed);
  if (!alert) return null;

  const styles = {
    info: {
      wrap: "border-kbc-info/25 bg-kbc-info-soft",
      icon: <Info className="h-5 w-5 text-kbc-info" />,
    },
    warning: {
      wrap: "border-kbc-alert/30 bg-kbc-alert-soft",
      icon: <AlertTriangle className="h-5 w-5 text-kbc-alert" />,
    },
    critical: {
      wrap: "border-red-300/50 bg-red-50",
      icon: <Siren className="h-5 w-5 text-red-600" />,
    },
  }[alert.severity];

  return (
    <div
      className={`animate-banner-in flex gap-3 rounded-xl border px-4 py-3 sm:px-5 ${styles.wrap}`}
      role="status"
    >
      <div className="mt-0.5 shrink-0">{styles.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-kbc-ink">{alert.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-kbc-slate">{alert.message}</p>
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="mt-2 text-sm font-medium text-kbc-green hover:underline"
        >
          Talk to Companion →
        </button>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismissAlert(alert.id)}
        className="shrink-0 self-start rounded-md p-1 text-kbc-slate/60 hover:bg-white/60"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function BudgetOverview() {
  const { profile, budget } = useApp();
  if (!budget || !profile.onboarded) return null;

  const pct = Math.min(100, Math.round((budget.totalSpent / budget.totalLimit) * 100));
  const capPct = Math.min(
    100,
    Math.round((budget.totalSpent / budget.recommendedCap) * 100)
  );

  return (
    <section className="animate-fade-up rounded-2xl border border-white/60 bg-white/90 p-6 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-kbc-green">
            Monthly pace
          </p>
          <h2 className="mt-1 font-display text-2xl text-kbc-ink">
            {lifeStageLabel(profile)} budget
          </h2>
        </div>
        <p className="text-sm text-kbc-slate">
          vs last month{" "}
          <span className="font-medium text-kbc-ink">
            {formatEUR(budget.previousMonthSpent)}
          </span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Spent MTD"
          value={formatEURPrecise(budget.totalSpent)}
          hint={`${pct}% of monthly framework`}
        />
        <Metric
          label="Monthly framework"
          value={formatEUR(budget.totalLimit)}
          hint={`${formatEUR(profile.annualBudgetGoal)} / year`}
        />
        <Metric
          label="Stay-on-track cap"
          value={formatEUR(budget.recommendedCap)}
          hint={`${capPct}% used · guided vs last month`}
          accent
        />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs text-kbc-slate">
          <span>Month-to-date</span>
          <span>
            {formatEURPrecise(budget.totalSpent)} / {formatEUR(budget.totalLimit)}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-kbc-sand">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kbc-green to-kbc-green-mid transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        accent ? "bg-kbc-green-light" : "bg-kbc-mist"
      }`}
    >
      <p className="text-xs text-kbc-slate">{label}</p>
      <p className="mt-1 font-display text-xl text-kbc-ink">{value}</p>
      <p className="mt-1 text-[11px] text-kbc-slate/80">{hint}</p>
    </div>
  );
}
