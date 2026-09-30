"use client";

import { useApp } from "@/context/AppContext";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { formatEURPrecise } from "@/lib/budget-engine";
import { Plane, MapPin } from "lucide-react";

export function CategoryBreakdown() {
  const { budget } = useApp();
  if (!budget) return null;

  return (
    <section className="animate-fade-up rounded-2xl border border-white/60 bg-white/90 p-6 shadow-soft">
      <h3 className="font-display text-xl text-kbc-ink">Category framework</h3>
      <p className="mt-1 text-sm text-kbc-slate">
        Weights reflect your household demographics and purchase history.
      </p>
      <ul className="mt-5 space-y-3">
        {budget.categories
          .filter((c) => c.monthlyLimit > 0)
          .slice(0, 8)
          .map((c) => {
            const pct = Math.min(100, (c.spent / c.monthlyLimit) * 100);
            const hot = pct >= 90;
            return (
              <li key={c.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-kbc-ink">{c.label}</span>
                  <span className={hot ? "font-medium text-kbc-alert" : "text-kbc-slate"}>
                    {formatEURPrecise(c.spent)} / {formatEURPrecise(c.monthlyLimit)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-kbc-sand">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      hot ? "bg-kbc-alert" : "bg-kbc-green"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}

export function TransactionFeed() {
  const { transactions } = useApp();
  if (!transactions.length) return null;

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="animate-fade-up rounded-2xl border border-white/60 bg-white/90 p-6 shadow-soft">
      <h3 className="font-display text-xl text-kbc-ink">Recent activity</h3>
      <ul className="mt-4 divide-y divide-kbc-sand">
        {sorted.slice(0, 10).map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-kbc-ink">
                {t.isAnomaly && (
                  <Plane className="mr-1.5 inline h-3.5 w-3.5 text-kbc-info" />
                )}
                {t.merchant}
              </p>
              <p className="text-xs text-kbc-slate">
                {t.date} · {CATEGORY_LABELS[t.category] ?? t.category}
                {t.destination ? ` · ${t.destination}` : ""}
              </p>
            </div>
            <p className="shrink-0 text-sm font-medium text-kbc-ink">
              −{formatEURPrecise(t.amount)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TripBudgetCard() {
  const { tripBudget, tripSaved } = useApp();
  if (!tripBudget) return null;

  return (
    <section className="animate-fade-up overflow-hidden rounded-2xl border border-kbc-info/20 bg-gradient-to-br from-kbc-info-soft to-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kbc-info text-white">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kbc-info">
            Destination sub-budget{tripSaved ? " · saved" : ""}
          </p>
          <h3 className="font-display text-xl text-kbc-ink">
            {tripBudget.destination} · {tripBudget.days} days
          </h3>
          <p className="mt-1 text-sm text-kbc-slate">
            {tripBudget.travelers} travelers ·{" "}
            {formatEURPrecise(tripBudget.dailyTotal)}/day · trip{" "}
            {formatEURPrecise(tripBudget.tripTotal)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["Meals", tripBudget.breakdown.meals],
            ["Transport", tripBudget.breakdown.transport],
            ["Activities", tripBudget.breakdown.activities],
            ["Extras", tripBudget.breakdown.incidentals],
          ] as const
        ).map(([label, amount]) => (
          <div key={label} className="rounded-lg bg-white/80 px-3 py-2">
            <p className="text-[11px] text-kbc-slate">{label}/day</p>
            <p className="font-medium text-kbc-ink">{formatEURPrecise(amount)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
