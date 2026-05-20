"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

/* Per-keystroke filters — stop bad characters at the source instead of
 * waiting for submit. Names get letters + name punctuation; phones get
 * digits + the few punctuation chars used in international numbers. */
const lettersOnly = /[^a-zA-Z\s'\-\.]/g;
const phoneChars = /[^0-9+\s()\-]/g;

function sanitize(
  e: React.ChangeEvent<HTMLInputElement>,
  pattern: RegExp,
) {
  const cleaned = e.target.value.replace(pattern, "");
  if (e.target.value !== cleaned) e.target.value = cleaned;
}

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
      setState("done");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "done") {
    return (
      <div className="card flex items-start gap-4 p-8">
        <div className="rounded-full bg-matcha-500/15 p-3 text-matcha-600">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl text-coffee-800">
            Message sent. Thank you.
          </h3>
          <p className="mt-2 text-sm text-coffee-500">
            We reply to every message, usually within a few hours during opening
            time. Check your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card flex flex-col gap-4 self-start p-6 sm:p-7 lg:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Name
          </label>
          <input
            name="name"
            required
            type="text"
            inputMode="text"
            autoComplete="name"
            maxLength={60}
            className="input mt-1.5 py-2.5"
            placeholder="Your name"
            onChange={(e) => sanitize(e, lettersOnly)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="input mt-1.5 py-2.5"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Phone (optional)
          </label>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            className="input mt-1.5 py-2.5"
            placeholder="+92 ..."
            onChange={(e) => sanitize(e, phoneChars)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Subject
          </label>
          <input
            name="subject"
            className="input mt-1.5 py-2.5"
            placeholder="What's on your mind?"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={4}
          className="input mt-1.5 resize-none"
          placeholder="Tell us a little more…"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-coffee-400">
          We reply to every message, usually within a few hours.
        </p>
        <button
          type="submit"
          disabled={state === "loading"}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-[0_8px_20px_-8px_rgba(46,27,16,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-coffee-800 hover:shadow-[0_14px_28px_-12px_rgba(46,27,16,0.55)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
}
