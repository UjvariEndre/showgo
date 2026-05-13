import { z } from "zod";

export const EVENT_GENRES = [
  "Rock",
  "Jazz",
  "Electronic",
  "Indie",
  "Hip-Hop",
  "Classical",
] as const;

export const eventGenreSchema = z.enum(EVENT_GENRES);
export type EventGenre = z.infer<typeof eventGenreSchema>;

/** Form values produced by the Create Event modal. */
export const eventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(80, "Title must be 80 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(160, "Description must be 160 characters or fewer"),
  genre: eventGenreSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Pick a time"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(60, "Location must be 60 characters or fewer"),
  venue: z
    .string()
    .trim()
    .min(2, "Venue must be at least 2 characters")
    .max(80, "Venue must be 80 characters or fewer"),
  organizer: z
    .string()
    .trim()
    .min(2, "Organizer must be at least 2 characters")
    .max(80, "Organizer must be 80 characters or fewer"),
  about: z
    .string()
    .trim()
    .min(20, "Tell people a bit more — at least 20 characters")
    .max(1200, "About must be 1200 characters or fewer"),
  image_url: z.string().url("Pick an image"),
});
export type EventFormValues = z.infer<typeof eventFormSchema>;

/** Shape of a row returned by Supabase `events` table. */
export const eventRowSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  location: z.string(),
  venue: z.string(),
  genre: z.string(),
  date: z.string(),
  time: z.string(),
  organizer: z.string(),
  about: z.string(),
  created_by: z.string().uuid().nullable().optional(),
});
export type EventRow = z.infer<typeof eventRowSchema>;
