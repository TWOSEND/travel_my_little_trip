import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import type { ApiResponse } from "@/app/lib/constants";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const { display_name, avatar_url } = payload;

  const updateData: Record<string, string> = {};
  if (typeof display_name === "string" && display_name.trim().length > 0) {
    updateData.display_name = display_name.trim();
  }
  if (typeof avatar_url === "string" && avatar_url.length > 0) {
    updateData.avatar_url = avatar_url;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json<ApiResponse>({ success: false, error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({ data: updateData });

  if (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json<ApiResponse>({ success: true });
}
