export interface EventImageOption {
  /** Stable identifier for keys / preselect comparison. */
  id: string;
  /** Card-size URL (saved to Supabase). */
  url: string;
  /** Smaller thumbnail URL used in the picker grid. */
  thumb: string;
  alt: string;
}

function unsplash(photoId: string, width: number) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

const PHOTOS: Array<{ id: string; alt: string }> = [
  { id: "1501386761578-eac5c94b800a", alt: "Crowd with hands raised at a rock concert" },
  { id: "1511192336575-5a79af67a629", alt: "Saxophonist on a dim jazz stage" },
  { id: "1506157786151-b8491531f063", alt: "DJ performing in front of a glowing crowd" },
  { id: "1459749411175-04bf5292ceea", alt: "Indie band lit by colored stage lights" },
  { id: "1470229722913-7c0e2dbbafd3", alt: "Singer at the mic in front of a packed crowd" },
  { id: "1429962714451-bb934ecdc4ec", alt: "Acoustic guitarist on a small stage" },
  { id: "1485579149621-3123dd979885", alt: "Vinyl turntable close-up" },
  { id: "1516280440614-37939bbacd81", alt: "Drum kit lit in pink and purple" },
  { id: "1504680177321-2e6a879aac86", alt: "String quartet rehearsing" },
];

export const EVENT_IMAGES: EventImageOption[] = PHOTOS.map((p) => ({
  id: p.id,
  url: unsplash(p.id, 800),
  thumb: unsplash(p.id, 200),
  alt: p.alt,
}));
