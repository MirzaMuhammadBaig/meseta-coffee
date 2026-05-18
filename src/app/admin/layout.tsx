import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { getStoreSettings, setStoreOpen } from "@/lib/admin/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminToast from "@/components/admin/AdminToast";
import { AdminUIProvider } from "@/components/admin/AdminUIProvider";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Meseta Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-pathname") ?? "";

  // /admin/login renders bare — no auth check (would redirect-loop), no sidebar.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const admin = await requireAdmin();
  const settings = await getStoreSettings();

  async function toggle(next: boolean, message?: string) {
    "use server";
    await setStoreOpen(next, message);
  }

  return (
    <AdminUIProvider>
      <div className="flex min-h-screen bg-cream-100/40">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopBar
            admin={admin}
            isOpen={settings.is_open}
            closedMessage={settings.closed_message}
            onToggle={toggle}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            {children}
          </main>
        </div>
        <Suspense fallback={null}>
          <AdminToast />
        </Suspense>
      </div>
    </AdminUIProvider>
  );
}
