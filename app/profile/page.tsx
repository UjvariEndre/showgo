import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProfileView } from "@/components/ProfileView";
import {
  getAttendingEventIds,
  getAttendingEvents,
  getCreatedEvents,
} from "@/lib/events";
import { getCurrentUser } from "@/lib/supabase-user-server";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [attending, created, attendingIds] = await Promise.all([
    getAttendingEvents(user.id),
    getCreatedEvents(user.id),
    getAttendingEventIds(user.id),
  ]);

  return (
    <>
      <Navbar user={user} />
      <main>
        <ProfileView
          user={user}
          attending={attending}
          created={created}
          attendingIds={attendingIds}
        />
      </main>
      <Footer />
    </>
  );
}
