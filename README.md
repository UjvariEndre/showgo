# ShowGo

A modern, responsive single-page web app for discovering live music events.
Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Framer Motion**, and **lucide-react**.

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Other scripts:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # next lint
```

> Requires Node 18.17+ (Node 20 recommended).

## What's in here

```
app/
  layout.tsx     # Root layout, fonts, metadata, viewport
  page.tsx       # Composes Navbar / Hero / EventList / Footer
  globals.css    # Tailwind layers + small utility helpers (.glass, .focus-ring)
components/
  Navbar.tsx     # Sticky translucent nav with mobile hamburger
  Hero.tsx       # Headline + animated sound-wave + CTA
  SoundWave.tsx  # GPU-friendly equalizer animation (transform/opacity only)
  EventCard.tsx  # Single event card with hover glow + viewport fade-in
  EventList.tsx  # Stacked list, staggered entrance
  Footer.tsx     # Wordmark + nav + social icons
lib/
  events.ts      # Typed seed data (the only data source today)
tailwind.config.ts
```

## Plugging in real event data

`lib/events.ts` is the single data source. The page imports it
synchronously today, but the `MusicEvent` type is the contract — keep
it stable and the UI won't change.

To swap in a real backend:

1. Create `lib/api.ts` with an async fetcher returning `MusicEvent[]`:

   ```ts
   import type { MusicEvent } from "./events";

   export async function getEvents(): Promise<MusicEvent[]> {
     const res = await fetch("https://your.api/events", {
       next: { revalidate: 60 }, // ISR — tune to taste
     });
     if (!res.ok) throw new Error("Failed to load events");
     return res.json();
   }
   ```

2. Make `app/page.tsx` an async Server Component:

   ```ts
   import { getEvents } from "@/lib/api";
   // ...
   export default async function Page() {
     const events = await getEvents();
     return (/* ...same JSX, pass `events` to <EventList /> */);
   }
   ```

3. Delete (or keep as fixtures) the seed array in `lib/events.ts`.

No component changes needed — `EventCard` / `EventList` only depend on
the `MusicEvent` shape.

## Design notes

- Dark mode only. Background `#0A0A0F`, accent gradient `#8B5CF6 → #A855F7`.
- Sound-wave uses only `transform` and `opacity` (no layout reads,
  no per-frame JS work) so it stays smooth on low-end devices.
- All interactive elements have visible focus states via the
  `.focus-ring` utility and accessible `aria-label`s.
- Cards stack on mobile; nav collapses to a hamburger under `md`.
