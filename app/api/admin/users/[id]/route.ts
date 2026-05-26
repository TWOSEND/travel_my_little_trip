import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { requireAdmin } from "@/app/lib/admin-auth";
import type { ApiResponse } from "@/app/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const { role, is_active } = (await request.json()) as {
    role?: string;
    is_active?: boolean;
  };

  const adminClient = createAdminClient();

  if (role !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await adminClient.from("profiles").upsert({ id, role } as any);
    await adminClient.auth.admin.updateUserById(id, { app_metadata: { role } });
  }

  if (is_active !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await adminClient.from("profiles").upsert({ id, is_active } as any);
    await adminClient.auth.admin.updateUserById(id, {
      ban_duration: is_active ? "none" : "876600h",
    });
  }

  const body: ApiResponse = { success: true };
  return NextResponse.json(body);
}
