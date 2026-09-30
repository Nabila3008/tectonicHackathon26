"use client";

import { useApp } from "@/context/AppContext";
import type { MaritalStatus, Occupation, Sex } from "@/types";
import { OCCUPATION_LABELS } from "@/lib/mock-data";
import { suggestAnnualBudget, formatEUR } from "@/lib/budget-engine";

export function OnboardingForm() {
  const { profile, updateProfileField, completeOnboardingForm, onboardingStep } =
    useApp();

  if (profile.onboarded || onboardingStep >= 2) return null;

  const suggested = suggestAnnualBudget(profile);
  const ready =
    profile.fullName.trim().length > 2 &&
    !!profile.dateOfBirth &&
    !!profile.occupation;

  return (
    <section className="animate-fade-up rounded-2xl border border-white/60 bg-white/90 p-6 shadow-soft sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-kbc-green">
        Dynamic profile
      </p>
      <h2 className="mt-2 font-display text-2xl text-kbc-ink sm:text-3xl">
        Tell us who you&apos;re budgeting for
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-kbc-slate">
        Demographics shape a realistic baseline — a married parent of two gets a
        different framework than a single young professional.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full legal name" className="sm:col-span-2">
          <input
            className={inputClass}
            value={profile.fullName}
            onChange={(e) => updateProfileField("fullName", e.target.value)}
            placeholder="e.g. Sofie Vermeulen"
          />
        </Field>

        <Field label="Date of birth">
          <input
            type="date"
            className={inputClass}
            value={profile.dateOfBirth}
            onChange={(e) => updateProfileField("dateOfBirth", e.target.value)}
          />
        </Field>

        <Field label="Sex">
          <select
            className={inputClass}
            value={profile.sex}
            onChange={(e) => updateProfileField("sex", e.target.value as Sex)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </Field>

        <Field label="Marital status">
          <select
            className={inputClass}
            value={profile.maritalStatus}
            onChange={(e) =>
              updateProfileField("maritalStatus", e.target.value as MaritalStatus)
            }
          >
            <option value="single">Single</option>
            <option value="partnered">Partnered</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </Field>

        <Field label="Number of children">
          <input
            type="number"
            min={0}
            max={8}
            className={inputClass}
            value={profile.numberOfChildren}
            onChange={(e) =>
              updateProfileField("numberOfChildren", Number(e.target.value) || 0)
            }
          />
        </Field>

        <Field label="Occupation" className="sm:col-span-2">
          <select
            className={inputClass}
            value={profile.occupation}
            onChange={(e) =>
              updateProfileField("occupation", e.target.value as Occupation)
            }
          >
            {Object.entries(OCCUPATION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-kbc-sand pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-kbc-slate">
          Suggested annual framework:{" "}
          <span className="font-medium text-kbc-ink">{formatEUR(suggested)}</span>
        </p>
        <button
          type="button"
          disabled={!ready}
          onClick={completeOnboardingForm}
          className="rounded-lg bg-kbc-green px-5 py-2.5 text-sm font-medium text-white transition hover:bg-kbc-green-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue with AI budget chat
        </button>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-lg border border-kbc-sand bg-[#fafcfb] px-3 py-2.5 text-sm text-kbc-ink outline-none focus:border-kbc-green/50 focus:ring-[3px] focus:ring-kbc-green/15";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-kbc-slate">{label}</span>
      {children}
    </label>
  );
}
