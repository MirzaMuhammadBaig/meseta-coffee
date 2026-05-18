import { redirect } from "next/navigation";
import Link from "next/link";
import { Coffee, LogIn } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Admin sign-in", robots: { index: false } };

async function signIn(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }
  // Confirm they're actually in admin_users; otherwise sign back out.
  const admin = await getCurrentAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    redirect(
      `/admin/login?error=${encodeURIComponent("This account is not an admin.")}`,
    );
  }
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-coffee-900 p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-2xl font-bold text-cream-50"
        >
          <Coffee className="h-7 w-7 text-gold-400" strokeWidth={1.6} />
          Meseta · Admin
        </Link>

        <form
          action={signIn}
          className="rounded-3xl bg-cream-50 p-8 shadow-2xl ring-1 ring-coffee-700/10"
        >
          <h1 className="font-display text-3xl text-coffee-800">Sign in</h1>
          <p className="mt-1 text-sm text-coffee-500">
            Manage menu, orders, deals and more.
          </p>

          {searchParams.error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {searchParams.error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="input mt-2"
                placeholder="webdev.muhammad@gmail.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-coffee-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="input mt-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary mt-7 w-full justify-center"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </button>

          <p className="mt-6 text-center text-xs text-coffee-400">
            Need an account? Ask the owner to add you via Supabase Auth.
          </p>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-xs uppercase tracking-[0.2em] text-cream-100/60 hover:text-cream-50"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
