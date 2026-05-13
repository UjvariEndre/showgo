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
    organizer: "Goldenvoice",
    about:
      "An evening of high-octane riffs and crowd-shaking choruses. Three touring bands take the stage at one of LA's most storied rooms, with a headliner set that pulls deep cuts from across a decade of records. Doors at 7, openers at 8 — get there early; the floor fills fast.",
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
    organizer: "Blue Note Jazz Club",
    about:
      "A late-night session blending bebop standards with original compositions written for the room. The five-piece quartet (yes, five — they like a second horn) trades tight arrangements for long-form improvisation as the night goes on. The kind of show where the audience leans in.",
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
    organizer: "Ostgut Ton",
    about:
      "Six DJs across three rooms, on the sound system that helped define modern techno. Expect rolling 4/4 in the main room, dub and breaks downstairs, and an ambient floor that doesn't open until 4 AM. No phones on the dancefloor — leave them in the locker, find the rhythm, stay till sunrise.",
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
    organizer: "Margin Walker Presents",
    about:
      "Four rising bands curated by Austin's sharpest tastemakers, all on one stage in one night. Lineup spans dream-pop, post-punk, and a closer that's been selling out clubs on the West Coast all summer. The kind of bill you'll claim you saw before they got big.",
  },
];
