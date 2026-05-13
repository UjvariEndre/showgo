"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/supabase-user-server";
import { eventFormSchema, type EventFormValues } from "@/models/event";

const SIGN_IN_REQUIRED = "You must be signed in to do this." as const;
const NOT_OWNER = "You can only modify events you created." as const;

async function assertOwnership(
  eventId: number,
  userId: string,
): Promise<MutateEventResult | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Event not found" };
  if (data.created_by !== userId) return { ok: false, error: NOT_OWNER };
  return null;
}

const STORAGE_BUCKET = "event-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type MutateEventResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof EventFormValues, string>> };

export async function createEvent(
  input: EventFormValues,
): Promise<MutateEventResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, ...buildValidationError(parsed.error.issues) };

  const { error } = await getSupabaseAdmin()
    .from("events")
    .insert({ ...parsed.data, created_by: user.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function updateEvent(
  id: string,
  input: EventFormValues,
): Promise<MutateEventResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return { ok: false, error: "Invalid event id" };

  const ownershipError = await assertOwnership(numericId, user.id);
  if (ownershipError) return ownershipError;

  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, ...buildValidationError(parsed.error.issues) };

  const { error } = await getSupabaseAdmin()
    .from("events")
    .update(parsed.data)
    .eq("id", numericId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<MutateEventResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return { ok: false, error: "Invalid event id" };

  const ownershipError = await assertOwnership(numericId, user.id);
  if (ownershipError) return ownershipError;

  const { error } = await getSupabaseAdmin().from("events").delete().eq("id", numericId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function attendEvent(eventId: string): Promise<MutateEventResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const numericId = Number(eventId);
  if (!Number.isFinite(numericId)) return { ok: false, error: "Invalid event id" };

  const { error } = await getSupabaseAdmin()
    .from("event_attendees")
    .upsert({ event_id: numericId, user_id: user.id }, { onConflict: "event_id,user_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function leaveEvent(eventId: string): Promise<MutateEventResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: SIGN_IN_REQUIRED };

  const numericId = Number(eventId);
  if (!Number.isFinite(numericId)) return { ok: false, error: "Invalid event id" };

  const { error } = await getSupabaseAdmin()
    .from("event_attendees")
    .delete()
    .eq("event_id", numericId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

function buildValidationError(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Partial<Record<keyof EventFormValues, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof EventFormValues | undefined;
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { error: "Validation failed", fieldErrors };
}

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  if (!(await getCurrentUser())) return { ok: false, error: SIGN_IN_REQUIRED };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  if (file.size === 0) return { ok: false, error: "File is empty" };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is larger than 5 MB" };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, or WebP images are allowed" };
  }

  const ext = MIME_TO_EXT[file.type];
  const path = `${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await getSupabaseAdmin().storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = getSupabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
