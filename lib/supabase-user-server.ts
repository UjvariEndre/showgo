import { WebSocket } from "ws";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as { WebSocket?: unknown }).WebSocket = WebSocket;
}

/**
 * Server-side Supabase client scoped to the current request's cookies.
 * Use inside Server Components and Server Actions to read the auth state.
 * The setAll callback is wrapped in try/catch because Server Components
 * are not allowed to write cookies — only Server Actions / Route Handlers are.
 */
export function getSupabaseUserServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component context — cookies are read-only.
          }
        },
      },
    },
  );
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await getSupabaseUserServer().auth.getUser();
  if (error) return null;
  return data.user;
}
