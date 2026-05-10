"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/session";

export async function createCandidate(formData: FormData) {
  const session = await requireSession("admin");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "").trim() || null;
  if (!name) return;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("candidates")
    .insert({
      name,
      role,
      source,
      created_by: session.email,
    })
    .select("id")
    .single();
  revalidatePath("/admin/candidates");
  if (data) redirect(`/admin/candidates/${data.id}`);
}

export async function updateCandidateStage(formData: FormData) {
  await requireSession("admin");
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  if (!id || !stage) return;
  const admin = createSupabaseAdminClient();
  await admin
    .from("candidates")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath(`/admin/candidates/${id}`);
  revalidatePath("/admin/candidates");
}
