"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck2,
  Coffee,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquareText,
  Power,
  Settings,
  Star,
  Tag,
  TrendingUp,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminUI } from "./AdminUIProvider";

const groups: {
  label: string;
  items: { href: string; label: string; icon: typeof BarChart3 }[];
}[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/revenue", label: "Revenue", icon: TrendingUp },
      { href: "/admin/orders", label: "Orders", icon: CreditCard },
      { href: "/admin/reservations", label: "Reservations", icon: CalendarCheck2 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
      { href: "/admin/deals", label: "Deals", icon: BarChart3 },
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
    ],
  },
  {
    label: "Inbox",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/store-status", label: "Store status", icon: Power },
      { href: "/admin/announcement", label: "Announcement", icon: Megaphone },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div className="border-b border-coffee-700/30 px-6 py-5">
        <Link
          href="/admin"
          onClick={onLinkClick}
          className="group flex items-center gap-2 font-display text-xl font-bold text-cream-50"
        >
          <Coffee
            className="h-6 w-6 text-gold-400 transition-transform duration-500 group-hover:-rotate-12"
            strokeWidth={1.6}
          />
          Meseta
          <span className="ml-1 rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-300">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-100/40">
              {g.label}
            </p>
            <ul className="mt-2 space-y-0.5">
              {g.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname?.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                        active
                          ? "bg-coffee-700/60 text-cream-50 shadow-[inset_2px_0_0_0_#d4a857]"
                          : "text-cream-100/70 hover:bg-coffee-700/40 hover:text-cream-50",
                      )}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-coffee-700/30 p-4">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-cream-100/60 transition hover:bg-coffee-700/40 hover:text-cream-50"
        >
          <MessageSquareText className="h-4 w-4" />
          View public site →
        </Link>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const { sidebarOpen, closeSidebar } = useAdminUI();

  return (
    <>
      {/* Desktop sidebar — sticky to viewport */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start border-r border-coffee-700/20 bg-coffee-900 text-cream-100/80 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={closeSidebar}
        className={cn(
          "fixed inset-0 z-40 bg-coffee-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile slide-in drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-coffee-700/20 bg-coffee-900 text-cream-100/80 shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="absolute right-3 top-3 rounded-full p-2 text-cream-100/60 transition hover:bg-coffee-700/40 hover:text-cream-50"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onLinkClick={closeSidebar} />
      </aside>
    </>
  );
}
