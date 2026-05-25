import PageHeading from "@/components/admin/PageHeading";
import BusynessForm from "@/components/admin/BusynessForm";
import { getStoreSettings } from "@/lib/admin/store";
import { updateBusyness } from "@/lib/admin/busyness";

export const metadata = { title: "Busyness" };

export default async function AdminBusynessPage() {
  const settings = await getStoreSettings();

  return (
    <>
      <PageHeading
        eyebrow="Operations"
        title="Busyness"
        description="Set how busy the café is right now. Orders auto-advance through Placed → Accepted → Preparing → Ready at the pace below. Completed and Cancelled stay manual."
      />

      <BusynessForm
        initialLevel={settings.busyness_level}
        initialMinutes={settings.auto_progress_minutes}
        onSave={updateBusyness}
      />
    </>
  );
}
