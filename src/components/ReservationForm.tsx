"use client";

import { useState } from "react";
import { CalendarCheck, Check, Loader2 } from "lucide-react";
import { useBranch } from "@/lib/branch/BranchProvider";

/* Per-keystroke filters. We sanitise as the user types instead of waiting
 * for submit — gives instant feedback and keeps bad characters out of
 * downstream code paths (FormData, API, DB). */
const lettersOnly = /[^a-zA-Z\s'\-\.]/g;
const phoneChars = /[^0-9+\s()\-]/g;
const nonDigits = /\D/g;

function sanitize(
  e: React.ChangeEvent<HTMLInputElement>,
  pattern: RegExp,
) {
  const cleaned = e.target.value.replace(pattern, "");
  if (e.target.value !== cleaned) e.target.value = cleaned;
}

function clampPeople(e: React.FocusEvent<HTMLInputElement>) {
  if (!e.target.value) return;
  const n = parseInt(e.target.value, 10);
  if (!Number.isFinite(n)) {
    e.target.value = "";
    return;
  }
  e.target.value = String(Math.min(Math.max(n, 1), 30));
}

export default function ReservationForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const { currentBranchId, current: currentBranch, branches } = useBranch();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const startDate = fd.get("start_date") as string;
    const startTime = fd.get("start_time") as string;
    const endDate = fd.get("end_date") as string;
    const endTime = fd.get("end_time") as string;

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    // Client-side guard so the user gets fast feedback before we hit the API.
    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime())
    ) {
      setState("error");
      setError("Please pick valid start and end times.");
      return;
    }
    if (end.getTime() <= start.getTime()) {
      setState("error");
      setError("End time must be after the start time.");
      return;
    }

    const payload = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      party_size: Number(fd.get("people")),
      reserved_for: start.toISOString(),
      ends_at: end.toISOString(),
      notes: fd.get("notes"),
      branch_id: currentBranchId,
    };

    try {
      const res = await fetch("/api/reservations", {
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
            Reservation received.
          </h3>
          <p className="mt-2 text-sm text-coffee-500">
            We will WhatsApp you to confirm your table within an hour. Can't wait
            to see you.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:p-8 lg:p-10">
      {currentBranch && branches.length > 1 && (
        <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-coffee-100 bg-cream-100/50 px-3 py-1.5 text-xs text-coffee-600">
          <span className="text-coffee-500">Reserving at</span>
          <span className="font-semibold text-coffee-800">
            {currentBranch.short_name ?? currentBranch.name}
          </span>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event("meseta:open-branch-picker"))
            }
            className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-coffee-700 ring-1 ring-coffee-100 transition hover:ring-coffee-300"
          >
            Switch
          </button>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Full name
          </label>
          <input
            name="name"
            required
            type="text"
            inputMode="text"
            autoComplete="name"
            maxLength={60}
            className="input mt-2"
            onChange={(e) => sanitize(e, lettersOnly)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Phone (WhatsApp)
          </label>
          <input
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="+92 ..."
            className="input mt-2"
            onChange={(e) => sanitize(e, phoneChars)}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            People
          </label>
          <input
            type="text"
            name="people"
            required
            inputMode="numeric"
            pattern="[0-9]+"
            autoComplete="off"
            maxLength={2}
            defaultValue="2"
            className="input mt-2"
            onChange={(e) => sanitize(e, nonDigits)}
            onBlur={clampPeople}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
            Email (optional)
          </label>
          <input type="email" name="email" className="input mt-2" />
        </div>
      </div>

      <fieldset className="grid gap-3 rounded-2xl border border-coffee-100 p-4 sm:p-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
          Starts
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-coffee-400">
              Start date
            </label>
            <input
              type="date"
              name="start_date"
              required
              min={today}
              className="input mt-2"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-coffee-400">
              Start time
            </label>
            <input
              type="time"
              name="start_time"
              required
              className="input mt-2"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl border border-coffee-100 p-4 sm:p-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
          Ends
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-coffee-400">
              End date
            </label>
            <input
              type="date"
              name="end_date"
              required
              min={today}
              className="input mt-2"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-coffee-400">
              End time
            </label>
            <input
              type="time"
              name="end_time"
              required
              className="input mt-2"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
          Notes (allergies, occasion, special requests)
        </label>
        <textarea name="notes" rows={4} className="input mt-2 resize-none" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-coffee-400">
          You will get a WhatsApp confirmation within the hour.
        </p>
        <button
          type="submit"
          disabled={state === "loading"}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-[0_8px_20px_-8px_rgba(46,27,16,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-coffee-800 hover:shadow-[0_14px_28px_-12px_rgba(46,27,16,0.55)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {state === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Booking
            </>
          ) : (
            <>
              <CalendarCheck className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110" />
              Request reservation
            </>
          )}
        </button>
      </div>
    </form>
  );
}
