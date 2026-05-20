import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth";
import type { ApiResponse } from "@/app/lib/constants";

export interface Todo {
  id: string;
  trip_id: string;
  content: string;
  done: boolean;
  created_at: string;
}

type Params = { params: Promise<{ id: string }> };

async function verifyTripOwner(tripId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id: tripId } = await params;
  const owns = await verifyTripOwner(tripId, user.id);
  if (!owns) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<Todo[]> = { success: true, data: data ?? [] };
  return NextResponse.json(body);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id: tripId } = await params;
  const owns = await verifyTripOwner(tripId, user.id);
  if (!owns) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ success: false, error: "내용을 입력하세요." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .insert({ trip_id: tripId, content: content.trim() })
    .select()
    .single();

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<Todo> = { success: true, data };
  return NextResponse.json(body, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id: tripId } = await params;
  const owns = await verifyTripOwner(tripId, user.id);
  if (!owns) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { id: todoId, done } = await req.json();
  if (!todoId || typeof done !== "boolean") {
    return NextResponse.json({ success: false, error: "id, done 필요" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .update({ done })
    .eq("id", todoId)
    .eq("trip_id", tripId)
    .select()
    .single();

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<Todo> = { success: true, data };
  return NextResponse.json(body);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id: tripId } = await params;
  const owns = await verifyTripOwner(tripId, user.id);
  if (!owns) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { id: todoId } = await req.json();
  if (!todoId) {
    return NextResponse.json({ success: false, error: "id 필요" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", todoId)
    .eq("trip_id", tripId);

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse = { success: true };
  return NextResponse.json(body);
}
