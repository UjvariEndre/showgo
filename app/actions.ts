"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { eventFormSchema, type EventFormValues } from "@/models/event";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export type CreateEventResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof EventFormValues, string>> };

export async function createEvent(
  input: EventFormValues,
): Promise<CreateEventResult> {
  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof EventFormValues, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof EventFormValues | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Validation failed", fieldErrors };
  }

  const { error } = await supabaseAdmin.from("events").insert(parsed.data);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}
