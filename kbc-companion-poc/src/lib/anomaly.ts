import type { DestinationBudget, Transaction, UserProfile } from "@/types";
import { householdSize } from "./budget-engine";

const TRAVEL_MERCHANTS = [
  /airline/i,
  /airways/i,
  /ryanair/i,
  /brussels airlines/i,
  /lufthansa/i,
  /easyjet/i,
  /booking\.com/i,
  /airbnb/i,
  /hotel/i,
  /expedia/i,
  /trainline/i,
  /eurostar/i,
];

const FLIGHT_HINTS = [/flight/i, /airline/i, /airways/i, /ryanair/i, /→/, /->/];
const HOTEL_HINTS = [/hotel/i, /booking\.com/i, /airbnb/i, /accommodation/i];

export interface AnomalyResult {
  isAnomaly: boolean;
  type?: "flight" | "hotel" | "large_purchase";
  destination?: string;
  confidence: number;
  reason: string;
}

export function detectAnomaly(
  tx: Transaction,
  recentAverage = 45
): AnomalyResult {
  if (tx.isAnomaly && tx.anomalyType) {
    return {
      isAnomaly: true,
      type: tx.anomalyType,
      destination: tx.destination,
      confidence: 0.95,
      reason: `Flagged ${tx.anomalyType} purchase at ${tx.merchant}`,
    };
  }

  const merchantHit = TRAVEL_MERCHANTS.some((r) => r.test(tx.merchant));
  const isFlight = FLIGHT_HINTS.some((r) => r.test(tx.merchant + " " + (tx.note ?? "")));
  const isHotel = HOTEL_HINTS.some((r) => r.test(tx.merchant + " " + (tx.note ?? "")));

  if (merchantHit && (isFlight || tx.category === "travel") && tx.amount >= 80) {
    return {
      isAnomaly: true,
      type: "flight",
      destination: tx.destination ?? extractDestination(tx.merchant),
      confidence: 0.88,
      reason: "Unusual travel booking detected",
    };
  }

  if (merchantHit && isHotel && tx.amount >= 120) {
    return {
      isAnomaly: true,
      type: "hotel",
      destination: tx.destination ?? extractDestination(tx.merchant),
      confidence: 0.86,
      reason: "Hotel or lodging booking detected",
    };
  }

  if (tx.amount >= recentAverage * 6 && tx.amount >= 250) {
    return {
      isAnomaly: true,
      type: "large_purchase",
      confidence: 0.7,
      reason: `Spend is ${Math.round(tx.amount / recentAverage)}× your typical transaction`,
    };
  }

  return { isAnomaly: false, confidence: 0, reason: "" };
}

function extractDestination(merchant: string): string | undefined {
  const arrow = merchant.match(/→\s*([A-Za-zÀ-ÿ\s]+)$/i);
  if (arrow) {
    const code = arrow[1].trim();
    const map: Record<string, string> = {
      FCO: "Rome",
      BCN: "Barcelona",
      CDG: "Paris",
      AMS: "Amsterdam",
      LHR: "London",
      MAD: "Madrid",
      LIS: "Lisbon",
    };
    return map[code] ?? code;
  }
  if (/rome|roma|fco/i.test(merchant)) return "Rome";
  if (/barcelona|bcn/i.test(merchant)) return "Barcelona";
  if (/paris|cdg/i.test(merchant)) return "Paris";
  return undefined;
}

/** Cost-of-living style daily budgets per destination (EUR, per adult baseline) */
const DESTINATION_DAILY: Record<
  string,
  { meals: number; transport: number; activities: number; incidentals: number; tips: string[] }
> = {
  Rome: {
    meals: 45,
    transport: 12,
    activities: 28,
    incidentals: 15,
    tips: [
      "Many museums are free on the first Sunday — plan around that.",
      "Aperitivo often replaces a full dinner and stretches the meals budget.",
      "Kids under 18 enter many state museums free with an adult.",
    ],
  },
  Barcelona: {
    meals: 40,
    transport: 10,
    activities: 30,
    incidentals: 14,
    tips: [
      "T-Casual metro cards beat single tickets for families.",
      "Book Gaudí sites early — walk-up prices and queues hurt both time and budget.",
      "Mercado lunch markets keep meal costs predictable.",
    ],
  },
  Paris: {
    meals: 50,
    transport: 14,
    activities: 32,
    incidentals: 16,
    tips: [
      "Museum Pass can pay for itself in 2–3 major stops.",
      "Bakery breakfasts free up the dinner budget.",
      "Avoid airport taxis — RER + metro is usually half the cost for a family.",
    ],
  },
  Amsterdam: {
    meals: 42,
    transport: 11,
    activities: 26,
    incidentals: 13,
    tips: [
      "GVB day tickets work well for short city breaks.",
      "Canal museums and parks balance paid attractions.",
      "Supermarket picnics in Vondelpark keep family days affordable.",
    ],
  },
  London: {
    meals: 48,
    transport: 16,
    activities: 30,
    incidentals: 18,
    tips: [
      "Contactless daily caps on Tube travel protect the transport line.",
      "Many major museums are free — spend on experiences instead.",
      "Off-peak trains into the city save meaningfully for day trips.",
    ],
  },
  default: {
    meals: 40,
    transport: 12,
    activities: 25,
    incidentals: 12,
    tips: [
      "Anchor one paid highlight per day and keep the rest flexible.",
      "Local groceries for breakfast cut trip food spend by ~20%.",
      "Build a 10% buffer for currency and tips.",
    ],
  },
};

export function buildDestinationBudget(
  destination: string,
  profile: UserProfile,
  days = 5
): DestinationBudget {
  const key =
    Object.keys(DESTINATION_DAILY).find(
      (d) => d.toLowerCase() === destination.toLowerCase()
    ) ?? "default";
  const base = DESTINATION_DAILY[key];
  const travelers = householdSize(profile);

  // Children cost ~60% of adult daily rates for meals/activities
  const adults =
    1 +
    (profile.maritalStatus === "married" || profile.maritalStatus === "partnered"
      ? 1
      : 0);
  const kids = profile.numberOfChildren;
  const personFactor = adults + kids * 0.6;

  // Affluence soft-adjust from occupation / annual goal
  const monthly = profile.annualBudgetGoal / 12;
  const lifestyle =
    monthly > 4000 ? 1.15 : monthly > 2800 ? 1.0 : monthly > 1800 ? 0.9 : 0.8;

  const meals = Math.round(base.meals * personFactor * lifestyle);
  const transport = Math.round(base.transport * Math.max(1, adults) * lifestyle);
  const activities = Math.round(base.activities * personFactor * lifestyle);
  const incidentals = Math.round(base.incidentals * personFactor * lifestyle);
  const dailyTotal = meals + transport + activities + incidentals;

  return {
    destination: key === "default" ? destination : key,
    days,
    travelers,
    currency: "EUR",
    dailyTotal,
    tripTotal: dailyTotal * days,
    breakdown: { meals, transport, activities, incidentals },
    tips: base.tips,
  };
}
