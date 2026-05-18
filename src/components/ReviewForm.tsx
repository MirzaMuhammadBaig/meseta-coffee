"use client";

import { useState } from "react";
import { Check, Loader2, Send, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const lettersOnly = /[^a-zA-Z\s'\-\.]/g;

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError("Please tap a star to give a rating.");
      return;
    }
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      body: fd.get("body"),
      rating,
    };
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setState("done");
      (e.target as HTMLFormElement).reset();
      setRating(0);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="card flex items-start gap-4 p-6 sm:p-8">
        <span className="rounded-full bg-matcha-500/15 p-3 text-matcha-600">
          <Check className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-2xl text-coffee-800">
            Thanks for sharing.
          </h3>
          <p className="mt-2 text-sm text-coffee-500">
            Your review is in our inbox. Once our team approves it, it appears
            on this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card grid gap-5 p-6 sm:p-7"
      aria-label="Leave a review"
    >
      <div>
        <p className="eyebrow">Leave a review</p>
        <h2 className="mt-2 font-display text-2xl text-coffee-800 sm:text-3xl">
          How was your visit?
        </h2>
        <p className="mt-2 text-sm text-coffee-500">
          We read every review and feature the standouts here.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
          Rating
        </label>
        <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className="rounded-md p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors duration-150",
                    filled
                      ? "fill-gold-500 text-gold-500"
                      : "text-coffee-200",
                  )}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Your name
          </label>
          <input
            name="name"
            required
            type="text"
            inputMode="text"
            autoComplete="name"
            maxLength={60}
            className="input mt-2"
            onChange={(e) => {
              const cleaned = e.target.value.replace(lettersOnly, "");
              if (e.target.value !== cleaned) e.target.value = cleaned;
            }}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
          Tell us a bit more
        </label>
        <textarea
          name="body"
          required
          rows={4}
          maxLength={1000}
          minLength={12}
          placeholder="What stood out? Drinks, sandwiches, the vibe…"
          className="input mt-2 resize-none"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-coffee-400">
          Reviews appear on the site after a quick check by our team.
        </p>
        <button
          type="submit"
          disabled={state === "loading"}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-[0_8px_20px_-8px_rgba(46,27,16,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-coffee-800 hover:shadow-[0_14px_28px_-12px_rgba(46,27,16,0.55)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Submit review
            </>
          )}
        </button>
      </div>
    </form>
  );
}
