import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { requireAdmin } from "@/app/lib/admin-auth";
import type { ApiResponse } from "@/app/lib/constants";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  is_active: boolean;
}

interface ProfileRow {
  id: string;
  role: string;
  is_active: boolean;
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const adminClient = createAdminClient();
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) {
    const body: ApiResponse = { success: false, error: usersError.message };
    return NextResponse.json(body, { status: 500 });
  }

  const { data: profilesRaw } = await adminClient.from("profiles").select("id, role, is_active");
  const profiles = profilesRaw as ProfileRow[] | null;
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const data: AdminUser[] = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    role: profileMap.get(u.id)?.role ?? "user",
    is_active: profileMap.get(u.id)?.is_active ?? true,
  }));

  const body: ApiResponse<AdminUser[]> = { success: true, data };
  return NextResponse.json(body);
}
