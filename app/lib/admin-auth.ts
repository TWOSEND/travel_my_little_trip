import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import type { AuthUser } from "@/app/lib/constants";

export async function requireAdmin(): Promise<
  { user: AuthUser; response?: never } | { user?: never; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return {
      response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (user.app_metadata?.role !== "admin") {
    return {
      response: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user: { id: user.id, email: user.email, role: "admin" } };
}
