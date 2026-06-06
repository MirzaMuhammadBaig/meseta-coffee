// Pure types + constants for orders.
// Kept out of `orders.ts` (which is marked "use server") because that
// file is only allowed to export async functions.

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type AdminOrder = {
  id: string;
  number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfilment: string;
  address: string | null;
  items: { slug: string; name: string; qty: number; price_pkr: number }[];
  subtotal_pkr: number;
  discount_pkr: number;
  total_pkr: number;
  payment_method: string;
  payment_status: string;
  status: OrderStatus;
  notes: string | null;
  coupon_code: string | null;
  safepay_tracker: string | null;
  paid_at: string | null;
  created_at: string;
  /** From migration 008 — null on legacy rows or pre-migration environments. */
  branch_id: string | null;
};

/** Allowed transitions, mirroring how a café actually processes an order. */
export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
