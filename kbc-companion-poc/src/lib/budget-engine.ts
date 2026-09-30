import type {
  BudgetCategory,
  MonthlyBudget,
  Transaction,
  TransactionCategory,
  UserProfile,
} from "@/types";
import { CATEGORY_LABELS } from "./mock-data";

const OCCUPATION_INCOME_INDEX: Record<string, number> = {
  student: 0.55,
  young_professional: 0.9,
  manager: 1.25,
  freelance: 0.95,
  public_sector: 1.05,
  retired: 0.75,
  other: 0.9,
};

/** Suggest an annual budget goal from demographics + lifestyle heuristics */
export function suggestAnnualBudget(profile: Partial<UserProfile>): number {
  const age = profile.dateOfBirth ? calcAge(profile.dateOfBirth) : 30;
  const kids = profile.numberOfChildren ?? 0;
  const married =
    profile.maritalStatus === "married" || profile.maritalStatus === "partnered";
  const occ = profile.occupation ?? "other";

  let base = 22000;
  base *= OCCUPATION_INCOME_INDEX[occ] ?? 0.9;

  if (age < 25) base *= 0.75;
  else if (age < 35) base *= 1.0;
  else if (age < 50) base *= 1.15;
  else base *= 1.05;

  if (married) base *= 1.35;
  base += kids * 4800;

  return Math.round(base / 500) * 500;
}

export function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function monthlyFromAnnual(annual: number): number {
  return Math.round((annual / 12) * 100) / 100;
}

const CATEGORY_WEIGHTS: Partial<Record<TransactionCategory, number>> = {
  housing: 0.32,
  groceries: 0.14,
  utilities: 0.08,
  transport: 0.08,
  dining: 0.07,
  shopping: 0.06,
  entertainment: 0.04,
  health: 0.04,
  childcare: 0.1,
  education: 0.03,
  travel: 0.03,
  other: 0.01,
};

function demographicWeights(profile: UserProfile): Partial<Record<TransactionCategory, number>> {
  const weights = { ...CATEGORY_WEIGHTS };
  const kids = profile.numberOfChildren;
  const age = calcAge(profile.dateOfBirth);

  if (kids === 0) {
    weights.childcare = 0;
    weights.education = 0.01;
    weights.dining = (weights.dining ?? 0.07) + 0.04;
    weights.entertainment = (weights.entertainment ?? 0.04) + 0.03;
    weights.housing = (weights.housing ?? 0.32) + 0.02;
  } else {
    weights.childcare = 0.08 + kids * 0.03;
    weights.groceries = (weights.groceries ?? 0.14) + kids * 0.02;
    weights.education = 0.02 + kids * 0.015;
  }

  if (age < 28) {
    weights.housing = Math.min(0.4, (weights.housing ?? 0.32) + 0.03);
    weights.entertainment = (weights.entertainment ?? 0.04) + 0.02;
  }

  if (profile.occupation === "student") {
    weights.housing = 0.38;
    weights.education = 0.12;
    weights.childcare = 0;
    weights.dining = 0.1;
  }

  return weights;
}

function normalizeWeights(
  weights: Partial<Record<TransactionCategory, number>>
): Record<TransactionCategory, number> {
  const entries = Object.entries(weights).filter(([, v]) => (v ?? 0) > 0) as [
    TransactionCategory,
    number,
  ][];
  const sum = entries.reduce((a, [, v]) => a + v, 0);
  const result = {} as Record<TransactionCategory, number>;
  for (const [k, v] of entries) {
    result[k] = v / sum;
  }
  return result;
}

export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function previousMonthKey(date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return monthKey(d);
}

export function sumSpent(transactions: Transaction[], key: string): number {
  return transactions
    .filter((t) => t.date.startsWith(key))
    .reduce((s, t) => s + t.amount, 0);
}

export function buildMonthlyBudget(
  profile: UserProfile,
  transactions: Transaction[]
): MonthlyBudget {
  const currentKey = monthKey();
  const prevKey = previousMonthKey();
  const totalLimit = monthlyFromAnnual(profile.annualBudgetGoal);
  const weights = normalizeWeights(demographicWeights(profile));

  const currentTx = transactions.filter((t) => t.date.startsWith(currentKey));
  const totalSpent = currentTx.reduce((s, t) => s + t.amount, 0);
  const previousMonthSpent = sumSpent(transactions, prevKey);

  const spentByCat: Partial<Record<TransactionCategory, number>> = {};
  for (const t of currentTx) {
    spentByCat[t.category] = (spentByCat[t.category] ?? 0) + t.amount;
  }

  const categories: BudgetCategory[] = (
    Object.keys(weights) as TransactionCategory[]
  ).map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    monthlyLimit: Math.round(totalLimit * weights[category] * 100) / 100,
    spent: Math.round((spentByCat[category] ?? 0) * 100) / 100,
  }));

  // Empathetic cap: stay on track vs last month + annual goal
  const goalPace = totalLimit;
  const lastMonth = previousMonthSpent || goalPace;
  const recommendedCap = Math.round(Math.min(goalPace, lastMonth * 0.95) * 100) / 100;

  return {
    monthKey: currentKey,
    totalLimit,
    totalSpent: Math.round(totalSpent * 100) / 100,
    categories: categories.sort((a, b) => b.monthlyLimit - a.monthlyLimit),
    previousMonthSpent: Math.round(previousMonthSpent * 100) / 100,
    recommendedCap,
  };
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEURPrecise(amount: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function householdSize(profile: UserProfile): number {
  const partner =
    profile.maritalStatus === "married" || profile.maritalStatus === "partnered"
      ? 1
      : 0;
  return 1 + partner + profile.numberOfChildren;
}

export function lifeStageLabel(profile: UserProfile): string {
  const age = calcAge(profile.dateOfBirth);
  const kids = profile.numberOfChildren;
  if (profile.occupation === "student" || age < 24) return "student life";
  if (kids > 0) return `family of ${householdSize(profile)}`;
  if (
    profile.maritalStatus === "married" ||
    profile.maritalStatus === "partnered"
  )
    return "couple household";
  if (age >= 55) return "pre-retirement";
  return "young professional";
}
