import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: "owner" | "admin" | "staff";
};

/**
 * Returns the current admin user, or null if not signed in / not an admin.
 * RLS on admin_users means any non-admin auth.users row gets back no row.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return (data as AdminUser) ?? null;
}

/** Use inside a Server Component / Server Action to gate admin pages. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
