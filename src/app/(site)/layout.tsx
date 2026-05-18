import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartFab from "@/components/cart/CartFab";
import CartDrawer from "@/components/cart/CartDrawer";
import StoreClosedBanner from "@/components/StoreClosedBanner";
import { CartProvider } from "@/lib/cart/CartProvider";
import { StoreStatusProvider } from "@/lib/store-status/StoreStatusProvider";
import { getStoreSettings } from "@/lib/admin/store";

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
  const isClosed = !!(settings && !settings.is_open);
  const showAnnouncement = !!(
    settings?.show_announcement && settings.announcement_text
  );

  return (
    <StoreStatusProvider
      value={{
        isOpen: settings?.is_open ?? true,
        closedMessage: settings?.closed_message ?? null,
      }}
    >
      <CartProvider>
        {isClosed && (
          <StoreClosedBanner message={settings?.closed_message ?? null} />
        )}
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
