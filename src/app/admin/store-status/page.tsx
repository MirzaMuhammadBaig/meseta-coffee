import { AlertTriangle, CheckCircle2 } from "lucide-react";
import PageHeading from "@/components/admin/PageHeading";
import StoreStatusForm from "@/components/admin/StoreStatusForm";
import { getStoreSettings, updateStoreStatus } from "@/lib/admin/store";

export const metadata = { title: "Store status" };

export default async function AdminStoreStatusPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const settings = await getStoreSettings();

  return (
    <>
      <PageHeading
        eyebrow="Configuration"
        title="Store status"
        description="Open or close the store with one click. The banner on the public site updates instantly."
      />

      {searchParams.saved && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-matcha-500/30 bg-matcha-500/10 p-4 text-sm text-matcha-700">
          <CheckCircle2 className="h-5 w-5" />
          <span>Store status saved. Customers see the change instantly.</span>
        </div>
      )}
      {searchParams.error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span>{searchParams.error}</span>
        </div>
      )}

      <StoreStatusForm
        initialIsOpen={settings.is_open}
        initialClosedMessage={settings.closed_message}
        initialClosedUntil={settings.closed_until}
        initialShowAnnouncement={settings.show_announcement}
        initialAnnouncementText={settings.announcement_text}
        onSave={updateStoreStatus}
      />
    </>
  );
}
