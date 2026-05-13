"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export type CreateEventResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createEvent(
  formData: FormData,
): Promise<CreateEventResult> {
  const row = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    genre: String(formData.get("genre") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    time: String(formData.get("time") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    venue: String(formData.get("venue") ?? "").trim(),
    organizer: String(formData.get("organizer") ?? "").trim(),
    about: String(formData.get("about") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
  };

  for (const [key, value] of Object.entries(row)) {
    if (!value) return { ok: false, error: `Missing field: ${key}` };
  }

  const { error } = await supabaseAdmin.from("events").insert(row);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}
