import { AlertTriangle, CheckCircle2, Save } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import { getStoreSettings, updateStoreSettings } from "@/lib/admin/store";

export const metadata = { title: "Settings" };

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const settings = await getStoreSettings();
  const hoursByDay = new Map(
    (settings.hours ?? []).map((h) => [h.day, h]),
  );

  return (
    <>
      <PageHeading
        eyebrow="Store"
        title="Settings"
        description="Hours, contact channels, payment methods and the closed-store banner."
      />

      {searchParams.saved && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-matcha-500/30 bg-matcha-500/10 p-4 text-sm text-matcha-700">
          <CheckCircle2 className="h-5 w-5" />
          <span>
            Settings saved. Changes are live on the public site.
          </span>
        </div>
      )}
      {searchParams.error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span>{searchParams.error}</span>
        </div>
      )}

      <form action={updateStoreSettings} className="grid gap-6">
        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">
            Closed-store message
          </h2>
          <p className="mt-1 text-sm text-coffee-500">
            Shown on the banner when the store is toggled off. The
            site-wide announcement banner now has its own page.
          </p>
          <textarea
            name="closed_message"
            rows={2}
            defaultValue={settings.closed_message ?? ""}
            placeholder="We're closed right now. Back tomorrow at 9am."
            className="input mt-4 resize-none"
          />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Hours</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DAYS.map((day) => {
              const h = hoursByDay.get(day);
              return (
                <div
                  key={day}
                  className="rounded-xl border border-coffee-100 p-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
                    {day}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="time"
                      name={`open_${day}`}
                      defaultValue={h?.open ?? "09:00"}
                      className="input"
                    />
                    <span className="text-coffee-400">→</span>
                    <input
                      type="time"
                      name={`close_${day}`}
                      defaultValue={h?.close ?? "01:00"}
                      className="input"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Contact</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              name="contact_phone"
              label="Phone"
              defaultValue={settings.contact_phone}
            />
            <Field
              name="contact_whatsapp"
              label="WhatsApp"
              defaultValue={settings.contact_whatsapp}
            />
            <Field
              name="contact_email"
              label="Email"
              defaultValue={settings.contact_email}
              type="email"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">Social</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              name="social_instagram"
              label="Instagram URL"
              defaultValue={settings.social_instagram}
              type="url"
            />
            <Field
              name="social_facebook"
              label="Facebook URL"
              defaultValue={settings.social_facebook}
              type="url"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          <h2 className="font-display text-xl text-coffee-800">
            Payment methods
          </h2>
          <p className="mt-1 text-sm text-coffee-500">
            Toggle individual checkout options.
          </p>
          <div className="mt-5 space-y-2">
            <label className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-cream-100">
              <input
                type="checkbox"
                name="accept_card_payments"
                defaultChecked={settings.accept_card_payments}
                className="h-4 w-4 rounded border-coffee-200 text-coffee-700"
              />
              <span className="text-coffee-700">Card payments (Safepay)</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-cream-100">
              <input
                type="checkbox"
                name="accept_cash_payments"
                defaultChecked={settings.accept_cash_payments}
                className="h-4 w-4 rounded border-coffee-200 text-coffee-700"
              />
              <span className="text-coffee-700">Cash on pickup</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cream-50 shadow-[0_12px_28px_-10px_rgba(46,27,16,0.6)] transition hover:bg-coffee-800"
          >
            <Save className="h-4 w-4" /> Save settings
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="input mt-2"
      />
    </div>
  );
}
