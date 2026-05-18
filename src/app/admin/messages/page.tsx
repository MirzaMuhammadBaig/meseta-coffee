import PageHeading from "@/components/admin/PageHeading";
import { listMessages, toggleMessageHandled } from "@/lib/admin/inbox";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await listMessages();

  async function setHandled(id: string, handled: boolean) {
    "use server";
    await toggleMessageHandled(id, handled);
  }

  return (
    <>
      <PageHeading
        eyebrow="Inbox"
        title="Messages"
        description="Every submission from the contact form lands here."
      />

      {messages.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-coffee-500 ring-1 ring-coffee-100">
          No messages yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={
                "rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 transition " +
                (m.handled ? "ring-coffee-100" : "ring-gold-500/30")
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-coffee-800">
                    {m.name}
                    {m.subject && (
                      <span className="ml-2 text-sm font-normal text-coffee-500">
                        · {m.subject}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-coffee-400">
                    {m.email}
                    {m.phone && <> · {m.phone}</>}
                    {" · "}
                    {formatDate(m.created_at)}
                  </p>
                </div>
                <form action={setHandled.bind(null, m.id, !m.handled)}>
                  <button
                    type="submit"
                    className={
                      "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition " +
                      (m.handled
                        ? "border border-coffee-200 text-coffee-500 hover:bg-cream-100"
                        : "bg-matcha-600 text-cream-50 hover:bg-matcha-500")
                    }
                  >
                    {m.handled ? "Mark unread" : "Mark handled"}
                  </button>
                </form>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-coffee-700">
                {m.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
