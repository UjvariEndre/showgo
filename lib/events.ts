import { eventRowSchema, type EventRow } from "@/models/event";
import { getSupabasePublic } from "./supabase-server";

export type EventCategory =
  | "Rock"
  | "Jazz"
  | "Electronic"
  | "Indie"
  | "Hip-Hop"
  | "Classical";

export interface MusicEvent {
  id: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  city: string;
  venue: string;
  category: EventCategory;
  /** ISO 8601 date — UI formats it for display */
  date: string;
  /** e.g. "21:00" */
  time: string;
  organizer: string;
  /** Long-form description shown in the event details modal */
  about: string;
  /** auth.users.id of the creator, or null for legacy seeded events. */
  createdBy: string | null;
}

function mapRow(row: EventRow): MusicEvent {
  return {
    id: String(row.id),
    name: row.title,
    description: row.description,
    image: row.image_url,
    imageAlt: row.title,
    city: row.location,
    venue: row.venue,
    category: row.genre as EventCategory,
    date: row.date,
    time: row.time,
    organizer: row.organizer,
    about: row.about,
    createdBy: row.created_by ?? null,
  };
}

const EVENT_COLUMNS =
  "id, title, description, image_url, location, venue, genre, date, time, organizer, about, created_by";

function parseRows(rows: unknown[]): MusicEvent[] {
  const events: MusicEvent[] = [];
  for (const raw of rows) {
    const parsed = eventRowSchema.safeParse(raw);
    if (parsed.success) {
      events.push(mapRow(parsed.data));
    } else {
      console.warn("[events] dropping malformed row", parsed.error.issues, raw);
    }
  }
  return events;
}

export async function getEvents(): Promise<MusicEvent[]> {
  const { data, error } = await getSupabasePublic()
    .from("events")
    .select(EVENT_COLUMNS)
    .order("date", { ascending: true });

  if (error) throw error;
  return parseRows(data ?? []);
}

export async function getCreatedEvents(userId: string): Promise<MusicEvent[]> {
  const { data, error } = await getSupabasePublic()
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("created_by", userId)
    .order("date", { ascending: true });

  if (error) throw error;
  return parseRows(data ?? []);
}

export async function getAttendingEvents(userId: string): Promise<MusicEvent[]> {
  const { data, error } = await getSupabasePublic()
    .from("event_attendees")
    .select(`event:events(${EVENT_COLUMNS})`)
    .eq("user_id", userId);

  if (error) throw error;
  const rows = (data ?? [])
    .map((r) => (r as { event: unknown }).event)
    .filter((e): e is Record<string, unknown> => !!e);
  return parseRows(rows).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAttendingEventIds(userId: string): Promise<Set<string>> {
  const { data, error } = await getSupabasePublic()
    .from("event_attendees")
    .select("event_id")
    .eq("user_id", userId);

  if (error) {
    console.warn("[events] could not load attending ids", error);
    return new Set();
  }
  return new Set((data ?? []).map((r) => String((r as { event_id: number }).event_id)));
}
