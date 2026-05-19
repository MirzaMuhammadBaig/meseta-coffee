/**
 * Client-safe menu image constants.
 *
 * Lives in its own file (no `next/headers` imports, no Supabase client)
 * so Client Components can import it without pulling in server-only code.
 */
export const FALLBACK_MENU_IMAGE =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80";
