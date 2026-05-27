"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/auth";
import type { Coupon } from "@/lib/admin/coupons";
import type { Deal } from "@/lib/admin/deals";

/**
 * Per-coupon stats derived from the `orders` table.
 *
 *   • orders_count          — orders that successfully applied this code
 *                              (i.e. not cancelled). Captured + cash both count.
 *   • total_saved_pkr       — Rs the customer saved via this coupon, summed
 *   • total_revenue_pkr     — Rs the café actually billed for those orders
 *   • avg_order_value_pkr   — total_revenue / orders_count
 *   • first_used_at         — when the first redemption happened
 *   • last_used_at          — most recent redemption
 */
export type CouponStats = {
  orders_count: number;
  total_saved_pkr: number;
  total_revenue_pkr: number;
  avg_order_value_pkr: number;
  first_used_at: string | null;
  last_used_at: string | null;
};

export type CouponWithStats = Coupon & {
  stats: CouponStats;
  /** Derived smart status (overrides is_active when expired / exhausted). */
  effective_status: "active" | "scheduled" | "expired" | "exhausted" | "inactive";
};

export type DealStats = {
  /** Number of order lines that benefitted from this deal. */
  lines_count: number;
  /** Number of distinct orders containing at least one line under this deal. */
  orders_count: number;
  /** Rs the customer saved via this deal across all lines. */
  total_saved_pkr: number;
  /** Revenue from orders that contained at least one line under this deal. */
  total_revenue_pkr: number;
  first_used_at: string | null;
  last_used_at: string | null;
};

export type DealWithStats = Deal & {
  stats: DealStats;
  effective_status:
    | "active"
    | "scheduled"
    | "ended"
    | "paused";
};

type OrderRow = {
  id: string;
  number: string;
  customer_name: string;
  total_pkr: number;
  discount_pkr: number;
  subtotal_pkr: number;
  coupon_code: string | null;
  items: { deal_id?: string | null; original_price_pkr?: number; price_pkr: number; qty: number }[] | null;
  status: string;
  payment_status: string;
  created_at: string;
};

/** Pull every order whose `coupon_code` matches (case-insensitive). */
export async function listOrdersForCoupon(
  code: string,
  limit = 50,
): Promise<OrderRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name, total_pkr, discount_pkr, subtotal_pkr, coupon_code, items, status, payment_status, created_at",
    )
    .ilike("coupon_code", code)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as OrderRow[]) ?? [];
}

/** Pull every order with at least one item attributed to this deal id. */
export async function listOrdersForDeal(
  dealId: string,
  limit = 50,
): Promise<OrderRow[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  // PostgREST jsonb containment: items @> [{ "deal_id": "…" }].
  const { data } = await supabase
    .from("orders")
    .select(
      "id, number, customer_name, total_pkr, discount_pkr, subtotal_pkr, coupon_code, items, status, payment_status, created_at",
    )
    .filter("items", "cs", JSON.stringify([{ deal_id: dealId }]))
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as OrderRow[]) ?? [];
}

function summariseCouponOrders(orders: OrderRow[]): CouponStats {
  if (orders.length === 0) {
    return {
      orders_count: 0,
      total_saved_pkr: 0,
      total_revenue_pkr: 0,
      avg_order_value_pkr: 0,
      first_used_at: null,
      last_used_at: null,
    };
  }
  let saved = 0;
  let revenue = 0;
  for (const o of orders) {
    saved += o.discount_pkr ?? 0;
    revenue += o.total_pkr ?? 0;
  }
  // Orders come back DESC, so first is most recent.
  return {
    orders_count: orders.length,
    total_saved_pkr: saved,
    total_revenue_pkr: revenue,
    avg_order_value_pkr: Math.round(revenue / orders.length),
    first_used_at: orders[orders.length - 1].created_at,
    last_used_at: orders[0].created_at,
  };
}

function summariseDealOrders(
  orders: OrderRow[],
  dealId: string,
): DealStats {
  if (orders.length === 0) {
    return {
      lines_count: 0,
      orders_count: 0,
      total_saved_pkr: 0,
      total_revenue_pkr: 0,
      first_used_at: null,
      last_used_at: null,
    };
  }
  let lines = 0;
  let saved = 0;
  let revenue = 0;
  for (const o of orders) {
    revenue += o.total_pkr ?? 0;
    for (const item of o.items ?? []) {
      if (item.deal_id !== dealId) continue;
      lines += 1;
      const orig = item.original_price_pkr ?? item.price_pkr;
      saved += (orig - item.price_pkr) * (item.qty ?? 1);
    }
  }
  return {
    lines_count: lines,
    orders_count: orders.length,
    total_saved_pkr: saved,
    total_revenue_pkr: revenue,
    first_used_at: orders[orders.length - 1].created_at,
    last_used_at: orders[0].created_at,
  };
}

/** Computed status for a coupon given its config. */
function couponEffectiveStatus(
  c: Coupon,
): CouponWithStats["effective_status"] {
  if (!c.is_active) return "inactive";
  if (c.expires_at && c.expires_at < new Date().toISOString()) return "expired";
  if (c.max_uses != null && c.uses_count >= c.max_uses) return "exhausted";
  return "active";
}

function dealEffectiveStatus(d: Deal): DealWithStats["effective_status"] {
  const now = new Date().toISOString();
  if (!d.is_active) return "paused";
  if (d.starts_at && d.starts_at > now) return "scheduled";
  if (d.ends_at && d.ends_at < now) return "ended";
  return "active";
}

/** Bulk-load coupons with stats. Used by /admin/coupons list. */
export async function listCouponsWithStats(): Promise<CouponWithStats[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const [{ data: couponsData }, { data: ordersData }] = await Promise.all([
    supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("coupon_code, discount_pkr, total_pkr, created_at, status")
      .not("coupon_code", "is", null)
      .neq("status", "cancelled"),
  ]);

  const coupons = (couponsData as Coupon[]) ?? [];
  const orders = (ordersData as Pick<OrderRow, "coupon_code" | "discount_pkr" | "total_pkr" | "created_at" | "status">[]) ?? [];

  // Bucket orders by coupon code (case-insensitive — codes are stored uppercase).
  const buckets = new Map<string, typeof orders>();
  for (const o of orders) {
    const k = (o.coupon_code ?? "").toUpperCase();
    if (!k) continue;
    const b = buckets.get(k) ?? [];
    b.push(o);
    buckets.set(k, b);
  }

  return coupons.map((c) => {
    const bucket = buckets.get(c.code.toUpperCase()) ?? [];
    const sorted = [...bucket].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    );
    const stats: CouponStats = sorted.length
      ? {
          orders_count: sorted.length,
          total_saved_pkr: sorted.reduce(
            (s, o) => s + (o.discount_pkr ?? 0),
            0,
          ),
          total_revenue_pkr: sorted.reduce((s, o) => s + (o.total_pkr ?? 0), 0),
          avg_order_value_pkr: Math.round(
            sorted.reduce((s, o) => s + (o.total_pkr ?? 0), 0) / sorted.length,
          ),
          first_used_at: sorted[sorted.length - 1].created_at,
          last_used_at: sorted[0].created_at,
        }
      : {
          orders_count: 0,
          total_saved_pkr: 0,
          total_revenue_pkr: 0,
          avg_order_value_pkr: 0,
          first_used_at: null,
          last_used_at: null,
        };
    return {
      ...c,
      stats,
      effective_status: couponEffectiveStatus(c),
    };
  });
}

/** Bulk-load deals with stats. Used by /admin/deals list. */
export async function listDealsWithStats(): Promise<DealWithStats[]> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const [{ data: dealsData }, { data: ordersData }] = await Promise.all([
    supabase
      .from("deals")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, total_pkr, items, created_at, status")
      .neq("status", "cancelled"),
  ]);

  const deals = (dealsData as Deal[]) ?? [];
  const orders = (ordersData as Pick<OrderRow, "id" | "total_pkr" | "items" | "created_at" | "status">[]) ?? [];

  // Bucket orders by deal id encountered in their items[].
  const buckets = new Map<string, typeof orders>();
  for (const o of orders) {
    const dealIdsInOrder = new Set<string>();
    for (const item of o.items ?? []) {
      if (item.deal_id) dealIdsInOrder.add(item.deal_id);
    }
    for (const id of dealIdsInOrder) {
      const b = buckets.get(id) ?? [];
      b.push(o);
      buckets.set(id, b);
    }
  }

  return deals.map((d) => {
    const bucket = buckets.get(d.id) ?? [];
    const sorted = [...bucket].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    );
    let lines = 0;
    let saved = 0;
    let revenue = 0;
    for (const o of sorted) {
      revenue += o.total_pkr ?? 0;
      for (const item of o.items ?? []) {
        if (item.deal_id !== d.id) continue;
        lines += 1;
        const orig = item.original_price_pkr ?? item.price_pkr;
        saved += (orig - item.price_pkr) * (item.qty ?? 1);
      }
    }
    return {
      ...d,
      stats: sorted.length
        ? {
            lines_count: lines,
            orders_count: sorted.length,
            total_saved_pkr: saved,
            total_revenue_pkr: revenue,
            first_used_at: sorted[sorted.length - 1].created_at,
            last_used_at: sorted[0].created_at,
          }
        : {
            lines_count: 0,
            orders_count: 0,
            total_saved_pkr: 0,
            total_revenue_pkr: 0,
            first_used_at: null,
            last_used_at: null,
          },
      effective_status: dealEffectiveStatus(d),
    };
  });
}

/** Single coupon's full stats + recent orders. */
export async function getCouponWithDetail(id: string): Promise<{
  coupon: Coupon | null;
  stats: CouponStats;
  status: CouponWithStats["effective_status"];
  recent_orders: OrderRow[];
}> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const coupon = (data as Coupon) ?? null;
  if (!coupon) {
    return {
      coupon: null,
      stats: {
        orders_count: 0,
        total_saved_pkr: 0,
        total_revenue_pkr: 0,
        avg_order_value_pkr: 0,
        first_used_at: null,
        last_used_at: null,
      },
      status: "inactive",
      recent_orders: [],
    };
  }
  const orders = await listOrdersForCoupon(coupon.code, 50);
  return {
    coupon,
    stats: summariseCouponOrders(orders),
    status: couponEffectiveStatus(coupon),
    recent_orders: orders,
  };
}

/** Single deal's full stats + recent orders. */
export async function getDealWithDetail(id: string): Promise<{
  deal: Deal | null;
  stats: DealStats;
  status: DealWithStats["effective_status"];
  recent_orders: OrderRow[];
}> {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const deal = (data as Deal) ?? null;
  if (!deal) {
    return {
      deal: null,
      stats: {
        lines_count: 0,
        orders_count: 0,
        total_saved_pkr: 0,
        total_revenue_pkr: 0,
        first_used_at: null,
        last_used_at: null,
      },
      status: "paused",
      recent_orders: [],
    };
  }
  const orders = await listOrdersForDeal(deal.id, 50);
  return {
    deal,
    stats: summariseDealOrders(orders, deal.id),
    status: dealEffectiveStatus(deal),
    recent_orders: orders,
  };
}
