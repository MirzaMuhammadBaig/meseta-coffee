"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Megaphone, Save } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dedicated editor for the site-wide announcement banner.
 *
 * One textarea — type a message and it shows on the public site; clear
 * it and the banner disappears. A live preview pane mirrors exactly what
 * customers will see at the top of every page.
 */
export default function AnnouncementForm({
  initialText,
  onSave,
}: {
  initialText: string | null;
  onSave: (fd: FormData) => void | Promise<void>;
}) {
  const [text, setText] = useState(initialText ?? "");
  const trimmed = text.trim();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
      {/* ─── Editor ────────────────────────────────────────── */}
      <form
        action={onSave}
        className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 sm:p-7"
      >
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
          Announcement message
        </label>
        <textarea
          name="announcement_text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          placeholder="E.g. Free brownie with every cold brew this week!"
          className="input mt-2 resize-none"
        />
        <p className="mt-2 text-xs text-coffee-500">
          Shows at the top of every page on the public site the moment you
          save. Leave it empty to hide the banner.
        </p>

        <div className="mt-7 flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
              trimmed ? "text-matcha-600" : "text-coffee-400",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                trimmed ? "bg-matcha-500" : "bg-coffee-300",
              )}
            />
            {trimmed ? "Banner is showing" : "Banner is hidden"}
          </span>
          <SaveButton />
        </div>
      </form>

      {/* ─── Live preview ──────────────────────────────────── */}
      <aside className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 sm:p-7">
        <h2 className="font-display text-xl text-coffee-800">
          What customers will see
        </h2>
        <p className="mt-1 text-sm text-coffee-500">
          Live preview of the banner at the top of the public site.
        </p>

        {trimmed ? (
          <div className="mt-5 rounded-2xl bg-gold-500 px-5 py-3 text-coffee-900">
            <div className="flex items-start gap-3">
              <Megaphone className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <p className="text-sm font-medium">{text}</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-coffee-200 p-6 text-center">
            <p className="text-sm text-coffee-500">
              No announcement banner is showing — the message is empty.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

/** Save button that shows a spinner while the action runs. */
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
          <Save className="h-3.5 w-3.5" /> Save announcement
        </>
      )}
    </button>
  );
}
