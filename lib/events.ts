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
}

/**
 * Seed event data. Replace this module with a server-side fetch
 * (e.g. `getEvents()` from a `lib/api.ts`) when wiring up a real backend.
 * Keep the `MusicEvent` shape stable so consuming components don't change.
 */
export const events: MusicEvent[] = [
  {
    id: "rock-concert",
    name: "Rock Concert",
    description:
      "High-voltage guitars and a packed mosh pit — the loudest night of the month.",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Crowd with hands in the air at a rock concert",
    city: "Los Angeles",
    venue: "The Wiltern",
    category: "Rock",
    date: "2026-06-14",
    time: "20:00",
  },
  {
    id: "jazz-night",
    name: "Jazz Night",
    description:
      "Smoky lounge improvisations from a five-piece quartet you'll want to see twice.",
    image:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Saxophonist performing on a dim jazz stage",
    city: "New York",
    venue: "Blue Note",
    category: "Jazz",
    date: "2026-06-21",
    time: "21:30",
  },
  {
    id: "electronic-party",
    name: "Electronic Party",
    description:
      "Warehouse techno till sunrise — three rooms, six DJs, zero phones on the floor.",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80",
    imageAlt: "DJ performing in front of glowing crowd",
    city: "Berlin",
    venue: "Berghain",
    category: "Electronic",
    date: "2026-07-05",
    time: "23:00",
  },
  {
    id: "indie-showcase",
    name: "Indie Showcase",
    description:
      "Four rising bands, one stage, and the city's best sound system. Get there early.",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Indie band performing under colored stage lights",
    city: "Austin",
    venue: "Mohawk",
    category: "Indie",
    date: "2026-07-12",
    time: "19:00",
  },
];
