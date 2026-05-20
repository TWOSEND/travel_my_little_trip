import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth";
import type { ApiResponse } from "@/app/lib/constants";

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<Trip[]> = { success: true, data: data ?? [] };
  return NextResponse.json(body);
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { title, destination, start_date, end_date } = await request.json();

  if (!title || !destination || !start_date || !end_date) {
    const body: ApiResponse = { success: false, error: "필수 항목을 모두 입력하세요." };
    return NextResponse.json(body, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .insert({ user_id: user.id, title, destination, start_date, end_date })
    .select()
    .single();

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<Trip> = { success: true, data };
  return NextResponse.json(body, { status: 201 });
}
