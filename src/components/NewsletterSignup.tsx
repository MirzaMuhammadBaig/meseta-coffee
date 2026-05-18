"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setState("done");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-cream-50/10 px-4 py-3 text-sm text-cream-50">
        <Check className="h-4 w-4 text-gold-400" />
        You are on the list. See you soon.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-full bg-cream-50/10 px-4 py-3 text-sm text-cream-50 placeholder:text-cream-100/40 transition-all duration-300 ease-out hover:bg-cream-50/15 focus:bg-cream-50/15 focus:outline-none focus:ring-2 focus:ring-gold-400"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        aria-label="Subscribe"
        className="group/btn shrink-0 rounded-full bg-gold-500 p-3 text-coffee-900 shadow-[0_8px_20px_-8px_rgba(184,138,58,0.7)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_14px_28px_-10px_rgba(184,138,58,0.8)] active:translate-y-0 active:scale-90 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
      >
        <Send className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </button>
      {error && (
        <p className="absolute mt-14 text-xs text-red-300">{error}</p>
      )}
    </form>
  );
}
