"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/session";

export async function createEmployee(formData: FormData) {
  await requireSession("admin");
  const name = String(formData.get("name") ?? "").trim();
  const dept = String(formData.get("dept") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const joinedAt = String(formData.get("joined_at") ?? "").trim() || null;
  if (!name) return;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("employees")
    .insert({ name, dept, role, email, joined_at: joinedAt })
    .select("id")
    .single();
  revalidatePath("/admin/employees");
  if (data) redirect(`/admin/employees/${data.id}`);
}
