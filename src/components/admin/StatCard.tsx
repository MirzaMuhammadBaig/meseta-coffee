import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  tone = "neutral",
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  tone?: "neutral" | "positive" | "warning";
  /** If set, the whole card becomes a link with a hover affordance. */
  href?: string;
}) {
  const Wrapper = href
    ? (p: { children: React.ReactNode }) => (
        <Link
          href={href}
          className="group block rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(66,41,26,0.35)] hover:ring-coffee-200"
        >
          {p.children}
        </Link>
      )
    : (p: { children: React.ReactNode }) => (
        <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_-18px_rgba(66,41,26,0.18)] ring-1 ring-coffee-100">
          {p.children}
        </div>
      );
  return (
    <Wrapper>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-coffee-400">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              tone === "positive" && "bg-matcha-500/12 text-matcha-600",
              tone === "warning" && "bg-red-50 text-red-600",
              tone === "neutral" && "bg-gold-500/15 text-gold-600",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl text-coffee-800 sm:text-4xl">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              trend.direction === "up" &&
                "bg-matcha-500/10 text-matcha-700",
              trend.direction === "down" && "bg-red-50 text-red-700",
              trend.direction === "flat" && "bg-coffee-100 text-coffee-600",
            )}
          >
            {trend.direction === "up" && "↑"}
            {trend.direction === "down" && "↓"}
            {trend.direction === "flat" && "→"}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-coffee-400">{hint}</span>}
        {href && (
          <span className="ml-auto text-coffee-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-coffee-700">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </Wrapper>
  );
}
