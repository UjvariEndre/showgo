import type { User } from "@supabase/supabase-js";

/** Pulls the display name from user_metadata.name; empty string if missing. */
export function nameOf(user: User): string {
  const raw = (user.user_metadata as { name?: unknown } | null | undefined)?.name;
  return typeof raw === "string" ? raw.trim() : "";
}

/** Name if present, otherwise the email — never empty so it can always be rendered. */
export function displayNameOf(user: User): string {
  return nameOf(user) || user.email || "Account";
}

/**
 * Two-letter initials drawn from the user's name. Uses the first letter of the
 * first word and the first letter of the last word, so a three-name human like
 * "Maria Anna Schmidt" still maps to "MS". Falls back to the email's first two
 * letters when no name is set.
 */
export function initialsOf(user: User): string {
  const name = nameOf(user);
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (user.email ?? "?").slice(0, 2).toUpperCase();
}
