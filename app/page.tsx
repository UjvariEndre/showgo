import { EventList } from "@/components/EventList";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { events } from "@/lib/events";

export default function Page() {
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
