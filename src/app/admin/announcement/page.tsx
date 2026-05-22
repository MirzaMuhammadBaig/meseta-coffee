import PageHeading from "@/components/admin/PageHeading";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import { getStoreSettings, updateAnnouncement } from "@/lib/admin/store";

export const metadata = { title: "Announcement" };

export default async function AdminAnnouncementPage() {
  const settings = await getStoreSettings();

  return (
    <>
      <PageHeading
        eyebrow="Configuration"
        title="Announcement banner"
        description="A site-wide message shown at the top of every page on the public site. Type a message to show it; clear it to hide it."
      />

      <AnnouncementForm
        initialText={settings.announcement_text}
        onSave={updateAnnouncement}
      />
    </>
  );
}
