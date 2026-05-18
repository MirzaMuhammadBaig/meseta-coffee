import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const lettersOnly = /[^a-zA-Z\s'\-\.]/g;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string"
    ? body.name.replace(lettersOnly, "").trim().slice(0, 60)
    : "";
  const body_ = typeof body.body === "string"
    ? body.body.trim().slice(0, 1000)
    : "";
  const ratingRaw = Number(body.rating);
  const rating =
    Number.isFinite(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
      ? Math.round(ratingRaw)
      : 0;

  if (!name || !body_ || !rating) {
    return NextResponse.json(
      { error: "Name, rating and review are all required." },
      { status: 400 },
    );
  }
  if (body_.length < 12) {
    return NextResponse.json(
      { error: "Please share a few more words about your visit." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("reviews").insert({
    source: "website",
    author_name: name,
    rating,
    body: body_,
    reviewed_at: new Date().toISOString().slice(0, 10),
    is_featured: false, // admin features it after moderation
  });

  if (error) {
    console.error("[reviews] insert failed", error);
    return NextResponse.json(
      { error: "Could not save your review. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
