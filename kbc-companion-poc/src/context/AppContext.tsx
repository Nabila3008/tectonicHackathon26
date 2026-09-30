"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  ChatMessage,
  DestinationBudget,
  MonthlyBudget,
  SpendingAlert,
  Transaction,
  UserProfile,
} from "@/types";
import {
  DEMO_PRESETS,
  EMPTY_PROFILE,
  FLIGHT_TEMPLATES,
  buildBaselineTransactions,
} from "@/lib/mock-data";
import {
  buildMonthlyBudget,
  suggestAnnualBudget,
} from "@/lib/budget-engine";
import {
  buildDestinationBudget,
  detectAnomaly,
} from "@/lib/anomaly";
import {
  alertChatMessage,
  budgetProposalMessage,
  buildSpendingAlert,
  handleFreeText,
  makeMessage,
  onboardingGreeting,
  resolveAction,
  tripBudgetMessage,
  tripDetectionMessage,
} from "@/lib/ai-companion";

interface AppState {
  profile: UserProfile;
  transactions: Transaction[];
  messages: ChatMessage[];
  alerts: SpendingAlert[];
  tripBudget: DestinationBudget | null;
  tripSaved: boolean;
  chatOpen: boolean;
  demoPanelOpen: boolean;
  onboardingStep: number;
  budget: MonthlyBudget | null;
  setChatOpen: (open: boolean) => void;
  setDemoPanelOpen: (open: boolean) => void;
  updateProfileField: <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => void;
  completeOnboardingForm: () => void;
  loadPreset: (presetId: string) => void;
  sendMessage: (text: string) => void;
  runAction: (actionId: string, value: string, label: string) => void;
  simulateFlightPurchase: (templateIndex?: number) => void;
  dismissAlert: (id: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([onboardingGreeting()]);
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [tripBudget, setTripBudget] = useState<DestinationBudget | null>(null);
  const [tripSaved, setTripSaved] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [demoPanelOpen, setDemoPanelOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const budget = useMemo(() => {
    if (!profile.onboarded || !profile.annualBudgetGoal) return null;
    return buildMonthlyBudget(profile, transactions);
  }, [profile, transactions]);

  const refreshAlerts = useCallback(
    (p: UserProfile, txs: Transaction[], pushChat: boolean) => {
      if (!p.onboarded || !p.annualBudgetGoal) {
        setAlerts([]);
        return;
      }
      const b = buildMonthlyBudget(p, txs);
      const alert = buildSpendingAlert(p, b);
      if (alert) {
        setAlerts([alert]);
        if (pushChat && alert.severity !== "info") {
          setMessages((prev) => [...prev, alertChatMessage(alert)]);
        }
      } else {
        setAlerts([]);
      }
    },
    []
  );

  const updateProfileField = useCallback(
    <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const completeOnboardingForm = useCallback(() => {
    setProfile((prev) => {
      const suggested = prev.annualBudgetGoal || suggestAnnualBudget(prev);
      const next = { ...prev, annualBudgetGoal: suggested };
      setMessages((msgs) => [...msgs, budgetProposalMessage(next)]);
      setOnboardingStep(1);
      setChatOpen(true);
      return next;
    });
  }, []);

  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = DEMO_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      const txs = buildBaselineTransactions(presetId);
      const p = { ...preset.profile };
      setProfile(p);
      setTransactions(txs);
      setTripBudget(null);
      setTripSaved(false);
      setOnboardingStep(2);
      setMessages([
        makeMessage(
          "assistant",
          `Loaded demo profile for ${p.fullName}. Budget framework: €${p.annualBudgetGoal.toLocaleString(
            "nl-BE"
          )}/year. I'm watching spend pace and travel anomalies.`,
          { kind: "guidance" }
        ),
      ]);
      refreshAlerts(p, txs, true);
      setChatOpen(true);
      setDemoPanelOpen(false);
    },
    [refreshAlerts]
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setMessages((prev) => [
        ...prev,
        makeMessage("user", trimmed),
        handleFreeText(trimmed, profile.onboarded ? profile : null, budget),
      ]);
    },
    [profile, budget]
  );

  const runAction = useCallback(
    (actionId: string, value: string, label: string) => {
      setMessages((prev) => [...prev, makeMessage("user", label)]);
      const result = resolveAction(
        { id: actionId, label, value },
        profile.onboarded ? profile : profile.fullName ? profile : null,
        budget,
        tripBudget
      );

      if (result.patch?.openDemoPicker) setDemoPanelOpen(true);

      if (result.patch?.annualBudgetGoal != null) {
        const goal = result.patch.annualBudgetGoal;
        setProfile((prev) => {
          const next = { ...prev, annualBudgetGoal: goal, onboarded: true };
          const txs =
            transactions.length > 0
              ? transactions
              : buildBaselineTransactions("custom");
          if (transactions.length === 0) setTransactions(txs);
          refreshAlerts(next, txs, true);
          setOnboardingStep(2);
          return next;
        });
      }

      if (result.patch?.confirmTrip) {
        const dest = result.patch.confirmTrip;
        const tb = buildDestinationBudget(dest, profile, 5);
        setTripBudget(tb);
        setMessages((prev) => [...prev, tripBudgetMessage(tb)]);
        return;
      }

      if (result.patch?.saveTrip) setTripSaved(true);

      if (result.messages.length) {
        setMessages((prev) => [...prev, ...result.messages]);
      }
    },
    [profile, budget, tripBudget, transactions, refreshAlerts]
  );

  const simulateFlightPurchase = useCallback(
    (templateIndex = 0) => {
      if (!profile.onboarded) {
        setMessages((prev) => [
          ...prev,
          makeMessage(
            "assistant",
            "Load a demo profile (or finish onboarding) first — then simulate a flight so I can intervene in context.",
            { kind: "guidance" }
          ),
        ]);
        setChatOpen(true);
        return;
      }

      const template = FLIGHT_TEMPLATES[templateIndex % FLIGHT_TEMPLATES.length];
      const tx: Transaction = {
        ...template,
        id: `sim-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
      };

      const anomaly = detectAnomaly(tx);
      const nextTx = [...transactions, tx];
      setTransactions(nextTx);
      refreshAlerts(profile, nextTx, false);
      setChatOpen(true);

      if (anomaly.isAnomaly && anomaly.type) {
        const anomalyType = anomaly.type;
        setMessages((prev) => [
          ...prev,
          makeMessage(
            "system",
            `New transaction: ${tx.merchant} · €${tx.amount.toFixed(2)}`,
            { kind: "alert" }
          ),
          tripDetectionMessage(
            anomaly.destination || tx.destination || "Europe",
            anomalyType,
            profile
          ),
        ]);
      }
    },
    [profile, transactions, refreshAlerts]
  );

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  }, []);

  const resetAll = useCallback(() => {
    setProfile(EMPTY_PROFILE);
    setTransactions([]);
    setMessages([onboardingGreeting()]);
    setAlerts([]);
    setTripBudget(null);
    setTripSaved(false);
    setOnboardingStep(0);
    setChatOpen(true);
  }, []);

  const value: AppState = {
    profile,
    transactions,
    messages,
    alerts,
    tripBudget,
    tripSaved,
    chatOpen,
    demoPanelOpen,
    onboardingStep,
    budget,
    setChatOpen,
    setDemoPanelOpen,
    updateProfileField,
    completeOnboardingForm,
    loadPreset,
    sendMessage,
    runAction,
    simulateFlightPurchase,
    dismissAlert,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
