export type Sex = "female" | "male" | "other" | "prefer_not_to_say";
export type MaritalStatus = "single" | "married" | "partnered" | "divorced" | "widowed";
export type Occupation =
  | "student"
  | "young_professional"
  | "manager"
  | "freelance"
  | "public_sector"
  | "retired"
  | "other";

export type TransactionCategory =
  | "groceries"
  | "housing"
  | "transport"
  | "dining"
  | "entertainment"
  | "shopping"
  | "health"
  | "utilities"
  | "travel"
  | "education"
  | "childcare"
  | "other";

export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  sex: Sex;
  maritalStatus: MaritalStatus;
  numberOfChildren: number;
  occupation: Occupation;
  annualBudgetGoal: number;
  onboarded: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: TransactionCategory;
  currency: "EUR";
  isAnomaly?: boolean;
  anomalyType?: "flight" | "hotel" | "large_purchase";
  destination?: string;
  note?: string;
}

export interface BudgetCategory {
  category: TransactionCategory;
  label: string;
  monthlyLimit: number;
  spent: number;
}

export interface MonthlyBudget {
  monthKey: string;
  totalLimit: number;
  totalSpent: number;
  categories: BudgetCategory[];
  previousMonthSpent: number;
  recommendedCap: number;
}

export interface DestinationBudget {
  destination: string;
  days: number;
  travelers: number;
  currency: "EUR";
  dailyTotal: number;
  tripTotal: number;
  breakdown: {
    meals: number;
    transport: number;
    activities: number;
    incidentals: number;
  };
  tips: string[];
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  timestamp: string;
  actions?: ChatAction[];
  kind?: "alert" | "trip" | "onboarding" | "guidance" | "general";
}

export interface ChatAction {
  id: string;
  label: string;
  value: string;
}

export interface SpendingAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  dismissed?: boolean;
}

export interface DemoProfilePreset {
  id: string;
  label: string;
  description: string;
  profile: UserProfile;
}
