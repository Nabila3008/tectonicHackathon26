import type {
  DemoProfilePreset,
  Transaction,
  UserProfile,
} from "@/types";

export const DEMO_PRESETS: DemoProfilePreset[] = [
  {
    id: "family",
    label: "Married parent of two",
    description: "Sofie · 38 · two kids · Antwerp family life",
    profile: {
      fullName: "Sofie Vermeulen",
      dateOfBirth: "1987-04-12",
      sex: "female",
      maritalStatus: "married",
      numberOfChildren: 2,
      occupation: "manager",
      annualBudgetGoal: 42000,
      onboarded: true,
    },
  },
  {
    id: "young_pro",
    label: "Single young professional",
    description: "Lucas · 27 · Brussels · early career",
    profile: {
      fullName: "Lucas Peeters",
      dateOfBirth: "1998-09-03",
      sex: "male",
      maritalStatus: "single",
      numberOfChildren: 0,
      occupation: "young_professional",
      annualBudgetGoal: 28000,
      onboarded: true,
    },
  },
  {
    id: "student",
    label: "Student in Ghent",
    description: "Amira · 21 · student · shared flat",
    profile: {
      fullName: "Amira Benali",
      dateOfBirth: "2004-01-22",
      sex: "female",
      maritalStatus: "single",
      numberOfChildren: 0,
      occupation: "student",
      annualBudgetGoal: 12000,
      onboarded: true,
    },
  },
  {
    id: "empty_nesters",
    label: "Partnered empty nesters",
    description: "Jan & Els · 58 · prep for retirement travel",
    profile: {
      fullName: "Jan De Smet",
      dateOfBirth: "1967-11-08",
      sex: "male",
      maritalStatus: "partnered",
      numberOfChildren: 0,
      occupation: "public_sector",
      annualBudgetGoal: 36000,
      onboarded: true,
    },
  },
];

export const EMPTY_PROFILE: UserProfile = {
  fullName: "",
  dateOfBirth: "",
  sex: "prefer_not_to_say",
  maritalStatus: "single",
  numberOfChildren: 0,
  occupation: "other",
  annualBudgetGoal: 0,
  onboarded: false,
};

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Baseline transactions for the active demo month + prior month */
export function buildBaselineTransactions(profileId: string): Transaction[] {
  const familyBoost = profileId === "family" ? 1.35 : profileId === "student" ? 0.55 : 1;
  const scale = (n: number) => Math.round(n * familyBoost * 100) / 100;

  return [
    // Previous month
    { id: "t-p1", date: daysAgo(35), merchant: "Colruyt", amount: scale(92.4), category: "groceries", currency: "EUR" },
    { id: "t-p2", date: daysAgo(33), merchant: "NMBS / SNCB", amount: scale(48.2), category: "transport", currency: "EUR" },
    { id: "t-p3", date: daysAgo(31), merchant: "Engie Electrabel", amount: scale(118), category: "utilities", currency: "EUR" },
    { id: "t-p4", date: daysAgo(30), merchant: "Rent payment", amount: scale(980), category: "housing", currency: "EUR" },
    { id: "t-p5", date: daysAgo(28), merchant: "Delhaize", amount: scale(76.1), category: "groceries", currency: "EUR" },
    { id: "t-p6", date: daysAgo(26), merchant: "Cinema UGC", amount: scale(28), category: "entertainment", currency: "EUR" },
    { id: "t-p7", date: daysAgo(24), merchant: "Lunch Garden", amount: scale(34.5), category: "dining", currency: "EUR" },
    { id: "t-p8", date: daysAgo(22), merchant: "Decathlon", amount: scale(64), category: "shopping", currency: "EUR" },
    { id: "t-p9", date: daysAgo(20), merchant: "Apotheek", amount: scale(22.8), category: "health", currency: "EUR" },
    { id: "t-p10", date: daysAgo(18), merchant: "Bol.com", amount: scale(41.9), category: "shopping", currency: "EUR" },
    { id: "t-p11", date: daysAgo(16), merchant: "Carrefour", amount: scale(88), category: "groceries", currency: "EUR" },
    { id: "t-p12", date: daysAgo(14), merchant: "Uber Eats", amount: scale(26.4), category: "dining", currency: "EUR" },
    ...(profileId === "family"
      ? ([
          {
            id: "t-p13",
            date: daysAgo(27),
            merchant: "Kinderopvang Zonnestraal",
            amount: 420,
            category: "childcare" as const,
            currency: "EUR" as const,
          },
          {
            id: "t-p14",
            date: daysAgo(21),
            merchant: "School supplies",
            amount: 85,
            category: "education" as const,
            currency: "EUR" as const,
          },
        ] as Transaction[])
      : []),

    // Current month-to-date
    { id: "t-c1", date: daysAgo(8), merchant: "Rent payment", amount: scale(980), category: "housing", currency: "EUR" },
    { id: "t-c2", date: daysAgo(7), merchant: "Colruyt", amount: scale(104.2), category: "groceries", currency: "EUR" },
    { id: "t-c3", date: daysAgo(6), merchant: "Proximus", amount: scale(55), category: "utilities", currency: "EUR" },
    { id: "t-c4", date: daysAgo(5), merchant: "Starbucks", amount: scale(8.4), category: "dining", currency: "EUR" },
    { id: "t-c5", date: daysAgo(4), merchant: "Delhaize", amount: scale(67.3), category: "groceries", currency: "EUR" },
    { id: "t-c6", date: daysAgo(3), merchant: "Zalando", amount: scale(79.9), category: "shopping", currency: "EUR" },
    { id: "t-c7", date: daysAgo(2), merchant: "NMBS / SNCB", amount: scale(18.6), category: "transport", currency: "EUR" },
    { id: "t-c8", date: daysAgo(1), merchant: "Restaurant Belga Queen", amount: scale(62), category: "dining", currency: "EUR" },
    ...(profileId === "family"
      ? ([
          {
            id: "t-c9",
            date: daysAgo(6),
            merchant: "Kinderopvang Zonnestraal",
            amount: 420,
            category: "childcare" as const,
            currency: "EUR" as const,
          },
        ] as Transaction[])
      : []),
  ];
}

export const FLIGHT_TEMPLATES: Omit<Transaction, "id" | "date">[] = [
  {
    merchant: "Brussels Airlines — BRU → FCO",
    amount: 412.5,
    category: "travel",
    currency: "EUR",
    isAnomaly: true,
    anomalyType: "flight",
    destination: "Rome",
    note: "Return flight booking",
  },
  {
    merchant: "Ryanair — CRL → BCN",
    amount: 186.0,
    category: "travel",
    currency: "EUR",
    isAnomaly: true,
    anomalyType: "flight",
    destination: "Barcelona",
    note: "Weekend city break",
  },
  {
    merchant: "Booking.com — Hotel Colosseum View",
    amount: 640.0,
    category: "travel",
    currency: "EUR",
    isAnomaly: true,
    anomalyType: "hotel",
    destination: "Rome",
    note: "3 nights accommodation",
  },
];

export const OCCUPATION_LABELS: Record<string, string> = {
  student: "Student",
  young_professional: "Young professional",
  manager: "Manager / senior",
  freelance: "Freelance / self-employed",
  public_sector: "Public sector",
  retired: "Retired",
  other: "Other",
};

export const CATEGORY_LABELS: Record<string, string> = {
  groceries: "Groceries",
  housing: "Housing",
  transport: "Transport",
  dining: "Dining out",
  entertainment: "Entertainment",
  shopping: "Shopping",
  health: "Health",
  utilities: "Utilities",
  travel: "Travel",
  education: "Education",
  childcare: "Childcare",
  other: "Other",
};
