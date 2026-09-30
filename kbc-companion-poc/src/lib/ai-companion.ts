import type {
  ChatAction,
  ChatMessage,
  DestinationBudget,
  MonthlyBudget,
  SpendingAlert,
  UserProfile,
} from "@/types";
import {
  formatEUR,
  formatEURPrecise,
  lifeStageLabel,
  suggestAnnualBudget,
} from "./budget-engine";

let msgCounter = 0;
export function makeMessage(
  role: ChatMessage["role"],
  content: string,
  extras?: Partial<ChatMessage>
): ChatMessage {
  msgCounter += 1;
  return {
    id: `msg-${Date.now()}-${msgCounter}`,
    role,
    content,
    timestamp: new Date().toISOString(),
    ...extras,
  };
}

export function onboardingGreeting(): ChatMessage {
  return makeMessage(
    "assistant",
    "Welcome to KBC Companion. I'm your proactive financial guide — not just a tracker. I'll learn your life stage, shape a realistic budget, and step in at the right moment. Shall we start with your profile?",
    {
      kind: "onboarding",
      actions: [
        { id: "start", label: "Let's begin", value: "start_onboarding" },
        { id: "demo", label: "Load a demo profile", value: "show_demos" },
      ],
    }
  );
}

export function budgetProposalMessage(profile: UserProfile): ChatMessage {
  const suggested = suggestAnnualBudget(profile);
  const stage = lifeStageLabel(profile);
  return makeMessage(
    "assistant",
    `Based on your ${stage} profile${
      profile.numberOfChildren
        ? ` with ${profile.numberOfChildren} child${profile.numberOfChildren > 1 ? "ren" : ""}`
        : ""
    }, a realistic annual spending framework is around ${formatEUR(
      suggested
    )} (${formatEUR(suggested / 12)}/month). Does that match your goals, or would you like to adjust?`,
    {
      kind: "onboarding",
      actions: [
        {
          id: "accept",
          label: `Accept ${formatEUR(suggested)}`,
          value: `accept_budget:${suggested}`,
        },
        { id: "lower", label: "Aim a bit lower", value: `accept_budget:${Math.round(suggested * 0.85 / 500) * 500}` },
        { id: "higher", label: "I can stretch higher", value: `accept_budget:${Math.round(suggested * 1.15 / 500) * 500}` },
      ],
    }
  );
}

export function buildSpendingAlert(
  profile: UserProfile,
  budget: MonthlyBudget
): SpendingAlert | null {
  const { totalSpent, previousMonthSpent, recommendedCap, totalLimit } = budget;
  const day = new Date().getDate();
  const paceExpected = (totalLimit / 30) * day;
  const overPace = totalSpent > paceExpected * 1.1;
  const vsLast = previousMonthSpent > 0 && totalSpent > previousMonthSpent * (day / 30) * 1.15;

  if (!overPace && !vsLast && totalSpent < recommendedCap * 0.5) {
    return {
      id: "pace-ok",
      severity: "info",
      title: "On track this month",
      message: `You've spent ${formatEURPrecise(totalSpent)} so far. Staying under ${formatEUR(
        recommendedCap
      )} keeps you aligned with last month and your ${lifeStageLabel(profile)} goals.`,
    };
  }

  if (totalSpent >= recommendedCap) {
    return {
      id: "pace-critical",
      severity: "critical",
      title: "Spending ceiling reached",
      message: `Based on your spending last month (${formatEUR(
        previousMonthSpent
      )}), you shouldn't spend more than ${formatEUR(
        recommendedCap
      )} this month to stay on track for your family goals. You're already at ${formatEURPrecise(
        totalSpent
      )}.`,
    };
  }

  if (overPace || vsLast) {
    const remaining = Math.max(0, recommendedCap - totalSpent);
    return {
      id: "pace-warn",
      severity: "warning",
      title: "Proactive spending check",
      message: `Based on your spending last month (${formatEUR(
        previousMonthSpent
      )}), you shouldn't spend more than ${formatEUR(
        recommendedCap
      )} this month to stay on track for your ${
        profile.numberOfChildren > 0 ? "family" : "personal"
      } goals. About ${formatEUR(remaining)} remains under that guide.`,
    };
  }

  return null;
}

export function alertChatMessage(alert: SpendingAlert): ChatMessage {
  return makeMessage("assistant", alert.message, {
    kind: "alert",
    actions:
      alert.severity === "critical"
        ? [
            { id: "tips", label: "Show cutback ideas", value: "spending_tips" },
            { id: "ok", label: "Got it", value: "dismiss_alert" },
          ]
        : [{ id: "ok", label: "Thanks", value: "dismiss_alert" }],
  });
}

export function tripDetectionMessage(
  destination: string,
  type: "flight" | "hotel" | "large_purchase",
  profile: UserProfile
): ChatMessage {
  const family =
    profile.numberOfChildren > 0 ||
    profile.maritalStatus === "married" ||
    profile.maritalStatus === "partnered";

  if (type === "flight" || type === "hotel") {
    return makeMessage(
      "assistant",
      `We noticed a ${type === "flight" ? "flight" : "hotel"} booking${
        destination ? ` linked to ${destination}` : ""
      }! ${
        family
          ? `Are you planning a family vacation${destination ? ` to ${destination}` : ""}?`
          : `Planning a trip${destination ? ` to ${destination}` : ""}?`
      } I can build a destination-specific daily budget for meals, transport, and activities.`,
      {
        kind: "trip",
        actions: [
          {
            id: "yes",
            label: "Yes — build my trip budget",
            value: `confirm_trip:${destination || "Europe"}`,
          },
          { id: "biz", label: "It's a work trip", value: "trip_business" },
          { id: "no", label: "Not a trip", value: "trip_dismiss" },
        ],
      }
    );
  }

  return makeMessage(
    "assistant",
    "That purchase looks larger than your usual pattern. Want me to check whether it affects this month's pace?",
    {
      kind: "alert",
      actions: [
        { id: "check", label: "Check my pace", value: "spending_tips" },
        { id: "ok", label: "All fine", value: "dismiss_alert" },
      ],
    }
  );
}

export function tripBudgetMessage(budget: DestinationBudget): ChatMessage {
  const { breakdown } = budget;
  return makeMessage(
    "assistant",
    `Here's a ${budget.days}-day ${budget.destination} budget for ${budget.travelers} traveler${
      budget.travelers > 1 ? "s" : ""
    }, tuned to your household:\n\n` +
      `• Meals: ${formatEUR(breakdown.meals)}/day\n` +
      `• Local transport: ${formatEUR(breakdown.transport)}/day\n` +
      `• Activities: ${formatEUR(breakdown.activities)}/day\n` +
      `• Incidentals: ${formatEUR(breakdown.incidentals)}/day\n\n` +
      `Daily total ≈ ${formatEUR(budget.dailyTotal)} · Trip total ≈ ${formatEUR(
        budget.tripTotal
      )}.\n\nTip: ${budget.tips[0]}`,
    {
      kind: "trip",
      actions: [
        { id: "save", label: "Save trip sub-budget", value: "save_trip_budget" },
        { id: "more", label: "More local tips", value: "trip_more_tips" },
      ],
    }
  );
}

export function spendingTipsMessage(budget: MonthlyBudget): ChatMessage {
  const over = budget.categories
    .filter((c) => c.spent > c.monthlyLimit * 0.85)
    .slice(0, 2);
  const lines =
    over.length > 0
      ? over
          .map(
            (c) =>
              `• Ease up on ${c.label.toLowerCase()} — ${formatEURPrecise(c.spent)} of ${formatEUR(
                c.monthlyLimit
              )} used`
          )
          .join("\n")
      : "• Batch grocery runs and pause discretionary shopping for 7 days.\n• Swap two restaurant meals for home cooking this week.";

  return makeMessage(
    "assistant",
    `To finish the month under ${formatEUR(budget.recommendedCap)}:\n${lines}`,
    { kind: "guidance" }
  );
}

export function handleFreeText(
  text: string,
  profile: UserProfile | null,
  budget: MonthlyBudget | null
): ChatMessage {
  const lower = text.toLowerCase();

  if (/budget|goal|limit/.test(lower) && budget) {
    return makeMessage(
      "assistant",
      `Your monthly framework is ${formatEUR(budget.totalLimit)}. You've used ${formatEURPrecise(
        budget.totalSpent
      )} month-to-date. Recommended ceiling vs last month: ${formatEUR(
        budget.recommendedCap
      )}.`,
      { kind: "guidance" }
    );
  }

  if (/trip|travel|vacation|holiday|rome|barcelona/.test(lower)) {
    return makeMessage(
      "assistant",
      "If you book a flight or hotel, I'll detect it automatically and offer a destination budget. You can also use Demo Controls → Simulate Flight Purchase for the pitch.",
      { kind: "trip" }
    );
  }

  if (/hello|hi |hey|thanks/.test(lower)) {
    return makeMessage(
      "assistant",
      `Happy to help${profile ? `, ${profile.fullName.split(" ")[0]}` : ""}. Ask me about your pace, categories, or upcoming travel.`,
      { kind: "general" }
    );
  }

  return makeMessage(
    "assistant",
    "I can explain your budget pace, flag unusual spend, or build a trip sub-budget when travel shows up. What would you like to explore?",
    { kind: "general" }
  );
}

export type ActionHandlerResult = {
  messages: ChatMessage[];
  patch?: {
    annualBudgetGoal?: number;
    openDemoPicker?: boolean;
    confirmTrip?: string;
    saveTrip?: boolean;
  };
};

export function resolveAction(
  action: ChatAction,
  profile: UserProfile | null,
  budget: MonthlyBudget | null,
  tripBudget: DestinationBudget | null
): ActionHandlerResult {
  const { value } = action;

  if (value === "start_onboarding") {
    return {
      messages: [
        makeMessage(
          "assistant",
          "Great. Fill in your demographics on the left — name, date of birth, family situation, and occupation. I'll propose a budget the moment your profile is ready.",
          { kind: "onboarding" }
        ),
      ],
    };
  }

  if (value === "show_demos") {
    return {
      messages: [
        makeMessage(
          "assistant",
          "Open Demo Controls and pick a life-stage profile. Each one loads realistic transactions so you can pitch the full journey in under two minutes.",
          { kind: "onboarding" }
        ),
      ],
      patch: { openDemoPicker: true },
    };
  }

  if (value.startsWith("accept_budget:")) {
    const amount = Number(value.split(":")[1]);
    return {
      messages: [
        makeMessage(
          "assistant",
          `Locked in ${formatEUR(
            amount
          )} per year. I'll watch your month-to-date spend against last month and nudge you before you drift off course.`,
          { kind: "onboarding" }
        ),
      ],
      patch: { annualBudgetGoal: amount },
    };
  }

  if (value.startsWith("confirm_trip:")) {
    const destination = value.split(":")[1] || "Rome";
    return {
      messages: [],
      patch: { confirmTrip: destination },
    };
  }

  if (value === "trip_business") {
    return {
      messages: [
        makeMessage(
          "assistant",
          "Understood — I'll treat that booking as business and keep it out of your leisure trip planning. Your monthly personal pace stays unchanged.",
          { kind: "trip" }
        ),
      ],
    };
  }

  if (value === "trip_dismiss") {
    return {
      messages: [
        makeMessage(
          "assistant",
          "No problem — I'll leave trip planning alone unless another travel signal appears.",
          { kind: "trip" }
        ),
      ],
    };
  }

  if (value === "save_trip_budget") {
    return {
      messages: [
        makeMessage(
          "assistant",
          tripBudget
            ? `Saved your ${tripBudget.destination} sub-budget (${formatEUR(
                tripBudget.dailyTotal
              )}/day). I'll keep it visible on your dashboard for the trip.`
            : "Trip budget saved.",
          { kind: "trip" }
        ),
      ],
      patch: { saveTrip: true },
    };
  }

  if (value === "trip_more_tips" && tripBudget) {
    return {
      messages: [
        makeMessage(
          "assistant",
          tripBudget.tips.map((t, i) => `${i + 1}. ${t}`).join("\n"),
          { kind: "trip" }
        ),
      ],
    };
  }

  if (value === "spending_tips" && budget) {
    return { messages: [spendingTipsMessage(budget)] };
  }

  if (value === "dismiss_alert") {
    return {
      messages: [
        makeMessage("assistant", "I'm here whenever you need a pulse check.", {
          kind: "general",
        }),
      ],
    };
  }

  return {
    messages: [
      makeMessage("assistant", "I'm with you — ask me anything about your budget.", {
        kind: "general",
      }),
    ],
  };
}
