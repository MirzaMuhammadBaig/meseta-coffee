"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save, Zap } from "lucide-react";
import {
  BUSYNESS_DESCRIPTIONS,
  BUSYNESS_LABELS,
  BUSYNESS_LEVELS,
  BUSYNESS_MULTIPLIERS,
  type AutoProgressMinutes,
  type BusynessLevel,
} from "@/lib/admin/busyness-types";
import { cn } from "@/lib/utils";

/**
 * Editor for the busyness level + base auto-progression timings.
 *
 *   • Level pills (Normal / Busy / Super busy) — the multiplier (×1/×2/×3)
 *     applied to the base minutes below.
 *   • Three minute inputs for the base transitions
 *     (placed → accepted → preparing → ready).
 *   • Live "Effective times at this level" preview so the admin sees
 *     exactly what changing busyness will do to each stage.
 *   • `ready`, `completed`, `cancelled` are always manual — called out.
 */
export default function BusynessForm({
  initialLevel,
  initialMinutes,
  onSave,
}: {
  initialLevel: BusynessLevel;
  initialMinutes: AutoProgressMinutes;
  onSave: (fd: FormData) => void | Promise<void>;
}) {
  const [level, setLevel] = useState<BusynessLevel>(initialLevel);
  const [minutes, setMinutes] = useState<AutoProgressMinutes>(initialMinutes);
  const mult = BUSYNESS_MULTIPLIERS[level];

  return (
    <form
      action={onSave}
      className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8"
    >
      {/* ─── Controls ─────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Level pills */}
        <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 sm:p-7">
          <h2 className="font-display text-xl text-coffee-800">
            Busyness level
          </h2>
          <p className="mt-1 text-sm text-coffee-500">
            Multiplies the base timings below. Cancelled and completed are
            always manual.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {BUSYNESS_LEVELS.map((lv) => {
              const active = level === lv;
              return (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLevel(lv)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all duration-200",
                    active
                      ? "border-coffee-700 bg-coffee-700 text-cream-50 shadow-[0_12px_28px_-12px_rgba(46,27,16,0.55)]"
                      : "border-coffee-100 bg-white text-coffee-700 hover:border-coffee-300",
                  )}
                >
                  <p className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.16em]">
                    {BUSYNESS_LABELS[lv]}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        active
                          ? "bg-gold-500 text-coffee-900"
                          : "bg-cream-100 text-coffee-600",
                      )}
                    >
                      ×{BUSYNESS_MULTIPLIERS[lv]}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-xs",
                      active ? "text-cream-100/80" : "text-coffee-500",
                    )}
                  >
                    {BUSYNESS_DESCRIPTIONS[lv]}
                  </p>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="busyness_level" value={level} />
        </section>

        {/* Base timings */}
        <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 sm:p-7">
          <h2 className="font-display text-xl text-coffee-800">
            Base auto-progress timings
          </h2>
          <p className="mt-1 text-sm text-coffee-500">
            Minutes between each stage. The effective wait is multiplied by
            the level above.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MinutesField
              name="placed_to_accepted"
              label="Placed → Accepted"
              value={minutes.placed_to_accepted}
              onChange={(v) =>
                setMinutes((m) => ({ ...m, placed_to_accepted: v }))
              }
            />
            <MinutesField
              name="accepted_to_preparing"
              label="Accepted → Preparing"
              value={minutes.accepted_to_preparing}
              onChange={(v) =>
                setMinutes((m) => ({ ...m, accepted_to_preparing: v }))
              }
            />
            <MinutesField
              name="preparing_to_ready"
              label="Preparing → Ready"
              value={minutes.preparing_to_ready}
              onChange={(v) =>
                setMinutes((m) => ({ ...m, preparing_to_ready: v }))
              }
            />
          </div>
        </section>

        <div className="flex justify-end">
          <SaveButton />
        </div>
      </div>

      {/* ─── Preview ──────────────────────────────────────────── */}
      <aside className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl text-coffee-800">
              Effective wait
            </h2>
            <p className="text-xs text-coffee-500">
              At <strong>{BUSYNESS_LABELS[level]}</strong> (×{mult}).
            </p>
          </div>
        </div>

        <ol className="mt-6 space-y-3 text-sm">
          <Step
            label="Order placed"
            sublabel={`auto-accepts in ${minutes.placed_to_accepted * mult} min`}
          />
          <Step
            label="Accepted"
            sublabel={`auto-starts preparing in ${minutes.accepted_to_preparing * mult} min`}
          />
          <Step
            label="Preparing"
            sublabel={`auto-marks ready in ${minutes.preparing_to_ready * mult} min`}
          />
          <Step
            label="Ready"
            sublabel="manual: admin marks Completed when handed off"
            terminal
          />
        </ol>

        <p className="mt-6 rounded-xl bg-cream-100/60 p-3 text-xs text-coffee-500">
          Completed and Cancelled are <strong>always manual</strong> — admins
          confirm physical fulfilment.
        </p>
      </aside>
    </form>
  );
}

function MinutesField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-coffee-500">
        {label}
      </label>
      <div className="mt-2 flex items-stretch overflow-hidden rounded-xl border border-coffee-100 bg-white focus-within:border-coffee-300 focus-within:ring-2 focus-within:ring-gold-400/40">
        <input
          type="number"
          name={name}
          min={1}
          max={120}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-coffee-800 focus:outline-none"
        />
        <span className="flex shrink-0 items-center bg-cream-100/60 px-3 text-xs uppercase tracking-[0.16em] text-coffee-500">
          min
        </span>
      </div>
    </div>
  );
}

function Step({
  label,
  sublabel,
  terminal,
}: {
  label: string;
  sublabel: string;
  terminal?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
          terminal ? "bg-coffee-300" : "bg-matcha-500",
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-coffee-800">{label}</p>
        <p className="text-xs text-coffee-500">{sublabel}</p>
      </div>
    </li>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-2 rounded-full bg-coffee-800 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition hover:bg-coffee-900 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Save className="h-3.5 w-3.5" /> Save busyness
        </>
      )}
    </button>
  );
}
