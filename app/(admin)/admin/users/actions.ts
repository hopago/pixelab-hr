"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/session";

export async function addAppUser(formData: FormData) {
  await requireSession("admin");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "interviewer");
  const fullName = String(formData.get("full_name") ?? "").trim() || null;
  if (!email || !["admin", "interviewer"].includes(role)) return;
  const admin = createSupabaseAdminClient();
  await admin
    .from("app_users")
    .upsert({ email, role, full_name: fullName }, { onConflict: "email" });
  revalidatePath("/admin/users");
}

export async function removeAppUser(formData: FormData) {
  const session = await requireSession("admin");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || email === session.email.toLowerCase()) return; // can't delete self
  const admin = createSupabaseAdminClient();
  await admin.from("app_users").delete().eq("email", email);
  revalidatePath("/admin/users");
}
