import { EventList } from "@/components/EventList";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { getEvents } from "@/lib/events";

export default async function Page() {
  const events = await getEvents();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <EventList events={events} />
      </main>
      <Footer />
    </>
  );
}
