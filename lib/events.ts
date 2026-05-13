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
  };
}

export async function getEvents(): Promise<MusicEvent[]> {
  const { data, error } = await getSupabasePublic()
    .from("events")
    .select(
      "id, title, description, image_url, location, venue, genre, date, time, organizer, about",
    )
    .order("date", { ascending: true });

  if (error) throw error;

  const events: MusicEvent[] = [];
  for (const raw of data ?? []) {
    const parsed = eventRowSchema.safeParse(raw);
    if (parsed.success) {
      events.push(mapRow(parsed.data));
    } else {
      console.warn("[getEvents] dropping malformed row", parsed.error.issues, raw);
    }
  }
  return events;
}
