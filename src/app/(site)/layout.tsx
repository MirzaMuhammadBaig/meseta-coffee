import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartFab from "@/components/cart/CartFab";
import CartDrawer from "@/components/cart/CartDrawer";
import StoreClosedBanner from "@/components/StoreClosedBanner";
import { CartProvider } from "@/lib/cart/CartProvider";
import { StoreStatusProvider } from "@/lib/store-status/StoreStatusProvider";
import { getStoreSettings } from "@/lib/admin/store";
import { getNextOpening, isWithinHours } from "@/lib/hours";

// Always render with fresh store-settings — so when the admin flips
// open/closed or updates the announcement, the public site reflects it
// on the very next request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings().catch(() => null);
  const adminOpen = settings?.is_open ?? true;
  const withinHours = isWithinHours();

  // Closed for EITHER reason: the admin's manual switch, or being
  // outside the published opening hours.
  const manuallyClosed = !adminOpen;
  const afterHours = adminOpen && !withinHours;
  const isClosed = manuallyClosed || afterHours;

  // Banner copy: a manual close shows the admin's message; an after-hours
  // close gets an auto schedule message ("we reopen tomorrow at 9 AM").
  let closedBannerMessage = settings?.closed_message ?? null;
  if (afterHours) {
    const next = getNextOpening();
    closedBannerMessage = next
      ? `We are closed right now. We reopen ${next.dayLabel} at ${next.time}.`
      : "We are closed right now.";
  }

  const showAnnouncement = !!(
    settings?.show_announcement && settings.announcement_text
  );

  return (
    // `isOpen` here is the *raw* admin switch — `useLiveStoreStatus`
    // combines it with the published hours itself.
    <StoreStatusProvider
      value={{
        isOpen: adminOpen,
        closedMessage: settings?.closed_message ?? null,
      }}
    >
      <CartProvider>
        {isClosed && <StoreClosedBanner message={closedBannerMessage} />}
        {showAnnouncement && (
          <StoreClosedBanner
            tone="info"
            message={settings!.announcement_text}
          />
        )}
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <CartFab />
        <CartDrawer />
      </CartProvider>
    </StoreStatusProvider>
  );
}
