"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/session";

export async function resolveSignal(formData: FormData) {
  await requireSession("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createSupabaseAdminClient();
  await admin
    .from("retention_signals")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/retention");
}

export async function reopenSignal(formData: FormData) {
  await requireSession("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createSupabaseAdminClient();
  await admin.from("retention_signals").update({ resolved_at: null }).eq("id", id);
  revalidatePath("/admin/retention");
}
