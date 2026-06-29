"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your PeptideStack assistant. Ask me about your current stack, dosing conventions, or how to approach a new goal. I'm not a doctor — always confirm changes with a licensed provider.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-3xl flex-col px-6 py-8">
      <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
      <p className="mt-1 text-sm text-gray-400">
        Grounded in your profile and current stack.
      </p>

      <div className="mt-6 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-emerald-500 text-black"
                  : "bg-white/10 text-gray-100"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="max-w-[85%] rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-gray-400">
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your stack, dosing, or goals..."
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
