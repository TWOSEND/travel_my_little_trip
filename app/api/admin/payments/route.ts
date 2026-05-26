import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { requireAdmin } from "@/app/lib/admin-auth";
import type { ApiResponse } from "@/app/lib/constants";

export interface AdminPayment {
  id: string;
  user_id: string;
  user_email: string;
  trip_id: string | null;
  trip_title: string;
  amount: number;
  status: "pending" | "completed" | "refunded";
  created_at: string;
}

export interface PaymentsResponse {
  payments: AdminPayment[];
  revenue: number;
}

interface PaymentRow {
  id: string;
  user_id: string;
  trip_id: string | null;
  amount: number;
  status: string;
  created_at: string;
  trips: { title: string } | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const adminClient = createAdminClient();

  let query = adminClient
    .from("payments")
    .select("*, trips(title)")
    .order("created_at", { ascending: false });
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);

  const [{ data: paymentsRaw, error }, { data: profilesRaw }] = await Promise.all([
    query,
    adminClient.from("profiles").select("id, email"),
  ]);

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const payments = paymentsRaw as PaymentRow[] | null;
  const profiles = profilesRaw as ProfileRow[] | null;
  const emailMap = new Map(profiles?.map((p) => [p.id, p.email ?? ""]) ?? []);

  const data: AdminPayment[] = (payments ?? []).map((p) => ({
    id: p.id,
    user_id: p.user_id,
    user_email: emailMap.get(p.user_id) ?? p.user_id,
    trip_id: p.trip_id,
    trip_title: p.trips?.title ?? "-",
    amount: p.amount,
    status: p.status as AdminPayment["status"],
    created_at: p.created_at,
  }));

  const revenue = data
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const body: ApiResponse<PaymentsResponse> = {
    success: true,
    data: { payments: data, revenue },
  };
  return NextResponse.json(body);
}
