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

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("reservations").insert({
    name,
    phone,
    email,
    party_size: people,
    reserved_for: start.toISOString(),
    ends_at: endsAt ? endsAt.toISOString() : null,
    notes,
  });

  if (error) {
    console.error("reservation insert failed", error);
    return NextResponse.json(
      { error: "Could not save your reservation. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
