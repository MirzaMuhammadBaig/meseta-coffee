import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : null;
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const people = Number(body.party_size);
  const reservedFor =
    typeof body.reserved_for === "string" ? body.reserved_for : "";
  const endsAtRaw =
    typeof body.ends_at === "string" ? body.ends_at : "";

  if (!name || !phone || !reservedFor || !Number.isFinite(people)) {
    return NextResponse.json(
      { error: "Name, phone, people and start time are required." },
      { status: 400 },
    );
  }
  if (people < 1 || people > 30) {
    return NextResponse.json(
      { error: "Number of people must be between 1 and 30." },
      { status: 400 },
    );
  }

  const start = new Date(reservedFor);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json(
      { error: "Invalid start date/time." },
      { status: 400 },
    );
  }
  if (start.getTime() < Date.now() - 60_000) {
    return NextResponse.json(
      { error: "Reservation must be in the future." },
      { status: 400 },
    );
  }

  let endsAt: Date | null = null;
  if (endsAtRaw) {
    endsAt = new Date(endsAtRaw);
    if (Number.isNaN(endsAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid end date/time." },
        { status: 400 },
      );
    }
    if (endsAt.getTime() <= start.getTime()) {
      return NextResponse.json(
        { error: "End time must be after the start time." },
        { status: 400 },
      );
    }
  }

  // Resolve the branch the customer is reserving at. Same defensive
  // pattern as /api/checkout — fall back to the main branch if the
  // claimed one is missing or invalid, so a legacy client cannot
  // create an orphaned reservation.
  const supabase = createSupabaseServiceClient();
  const claimedBranchId =
    typeof body.branch_id === "string" && (body.branch_id as string).trim()
      ? (body.branch_id as string).trim()
      : null;
  let branchId: string | null = null;
  try {
    if (claimedBranchId) {
      const { data: b } = await supabase
        .from("branches")
        .select("id")
        .eq("id", claimedBranchId)
        .eq("is_active", true)
        .maybeSingle();
      branchId = (b as { id: string } | null)?.id ?? null;
    }
    if (!branchId) {
      const { data: main } = await supabase
        .from("branches")
        .select("id")
        .eq("is_active", true)
        .eq("is_main", true)
        .maybeSingle();
      branchId = (main as { id: string } | null)?.id ?? null;
    }
  } catch {
    branchId = null;
  }

  const row: Record<string, unknown> = {
    name,
    phone,
    email,
    party_size: people,
    reserved_for: start.toISOString(),
    ends_at: endsAt ? endsAt.toISOString() : null,
    notes,
  };
  if (branchId) row.branch_id = branchId;

  let { error } = await supabase.from("reservations").insert(row);

  // Migration 008 not applied yet? Drop branch_id and retry so the
  // reservation still lands.
  if (error && /branch_id/i.test(error.message ?? "")) {
    const { branch_id: _omit, ...withoutBranch } = row;
    const retry = await supabase.from("reservations").insert(withoutBranch);
    error = retry.error;
  }

  if (error) {
    console.error("reservation insert failed", error);
    return NextResponse.json(
      { error: "Could not save your reservation. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
