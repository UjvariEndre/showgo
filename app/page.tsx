import { EventList } from "@/components/EventList";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { getEvents } from "@/lib/events";
import { getCurrentUser } from "@/lib/supabase-user-server";

export default async function Page() {
  const [events, user] = await Promise.all([getEvents(), getCurrentUser()]);
  return (
    <>
      <Navbar user={user} />
      <main>
        <Hero />
        <EventList events={events} user={user} />
      </main>
      <Footer />
    </>
  );
}
