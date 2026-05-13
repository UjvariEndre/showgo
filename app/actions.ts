"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { eventFormSchema, type EventFormValues } from "@/models/event";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

const STORAGE_BUCKET = "event-images";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
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

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
