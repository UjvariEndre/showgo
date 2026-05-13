import { WebSocket } from "ws";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// supabase-js 2.105 eagerly constructs a RealtimeClient inside createClient(),
// which requires a global WebSocket. Node < 22 doesn't expose one, so we
// polyfill before any createClient call. We don't actually use realtime.
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as { WebSocket?: unknown }).WebSocket = WebSocket;
}

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/** Read-only client using the publishable key. RLS-aware. */
export function getSupabasePublic(): SupabaseClient {
  if (!publicClient) {
    publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return publicClient;
}

/** Full-access client using the secret key. Bypasses RLS. Server-only. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
  }
  return adminClient;
}
