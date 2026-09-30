"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Send, X, Sparkles } from "lucide-react";
import clsx from "clsx";

export function AICompanion() {
  const {
    messages,
    chatOpen,
    setChatOpen,
    sendMessage,
    runAction,
    profile,
  } = useApp();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);

  if (!chatOpen) {
    return (
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-kbc-green px-4 py-3 text-sm font-medium text-white shadow-panel transition hover:bg-kbc-green-dark animate-pulse-soft"
      >
        <Sparkles className="h-4 w-4" />
        Companion
      </button>
    );
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col border-t border-kbc-sand bg-white shadow-panel animate-slide-in-right sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-[400px] sm:border-l sm:border-t-0">
      <div className="flex items-center justify-between border-b border-kbc-sand bg-gradient-to-r from-kbc-green-light to-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kbc-green text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-kbc-ink">KBC Companion</p>
            <p className="text-[11px] text-kbc-slate">
              {profile.onboarded ? "Proactive guidance live" : "Onboarding assistant"}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close assistant"
          onClick={() => setChatOpen(false)}
          className="rounded-lg p-1.5 text-kbc-slate hover:bg-kbc-mist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user" && "bg-kbc-green text-white",
                m.role === "assistant" && "bg-kbc-mist text-kbc-ink",
                m.role === "system" &&
                  "border border-dashed border-kbc-info/40 bg-kbc-info-soft text-kbc-info"
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.actions.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => runAction(a.id, a.value, a.label)}
                      className="rounded-lg border border-kbc-green/30 bg-white px-2.5 py-1.5 text-xs font-medium text-kbc-green transition hover:bg-kbc-green hover:text-white"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-kbc-sand p-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
          setInput("");
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about budget, pace, travel…"
            className="flex-1 rounded-xl border border-kbc-sand bg-kbc-mist/50 px-3 py-2.5 text-sm outline-none focus:border-kbc-green/50 focus:ring-2 focus:ring-kbc-green/15"
          />
          <button
            type="submit"
            aria-label="Send"
            className="rounded-xl bg-kbc-green px-3 text-white hover:bg-kbc-green-dark"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
