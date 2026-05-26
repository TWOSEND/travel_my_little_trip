import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { requireAdmin } from "@/app/lib/admin-auth";
import type { ApiResponse } from "@/app/lib/constants";

export interface AdminTrip {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  created_at: string;
}

interface TripRow {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  is_public: boolean | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const adminClient = createAdminClient();
  const [{ data: tripsRaw, error }, { data: profilesRaw }] = await Promise.all([
    adminClient.from("trips").select("*").order("created_at", { ascending: false }),
    adminClient.from("profiles").select("id, email"),
  ]);

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const trips = tripsRaw as TripRow[] | null;
  const profiles = profilesRaw as ProfileRow[] | null;
  const emailMap = new Map(profiles?.map((p) => [p.id, p.email ?? ""]) ?? []);

  const data: AdminTrip[] = (trips ?? []).map((t) => ({
    id: t.id,
    user_id: t.user_id,
    user_email: emailMap.get(t.user_id) ?? t.user_id,
    title: t.title,
    destination: t.destination,
    start_date: t.start_date,
    end_date: t.end_date,
    is_public: t.is_public ?? false,
    created_at: t.created_at,
  }));

  const body: ApiResponse<AdminTrip[]> = { success: true, data };
  return NextResponse.json(body);
}
