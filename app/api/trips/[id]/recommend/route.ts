import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth";
import type { ApiResponse } from "@/app/lib/constants";

export interface RecommendedPlace {
  id: string;
  trip_id: string;
  name: string;
  description: string;
  category: string;
  selected: boolean;
  created_at: string;
}

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id: tripId } = await params;

  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("destination, start_date, end_date")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();

  if (!trip) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "OPENAI_API_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `목적지: ${trip.destination}, 기간: ${trip.start_date} ~ ${trip.end_date}
위 여행에 적합한 장소 10곳을 추천해줘.
반드시 아래 JSON 배열 형식만 응답해. 다른 텍스트 없이.
[{ "name": string, "description": string, "category": string }]`;

  let places: { name: string; description: string; category: string }[];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);
    places = Array.isArray(parsed) ? parsed : (parsed.places ?? parsed.data ?? []);
  } catch {
    return NextResponse.json(
      { success: false, error: "AI 응답 파싱 실패" },
      { status: 500 },
    );
  }

  await supabase.from("recommended_places").delete().eq("trip_id", tripId);

  const rows = places.map((p) => ({
    trip_id: tripId,
    name: p.name,
    description: p.description,
    category: p.category,
  }));

  const { data, error } = await supabase
    .from("recommended_places")
    .insert(rows)
    .select();

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<RecommendedPlace[]> = { success: true, data: data ?? [] };
  return NextResponse.json(body);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id: tripId } = await params;

  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .eq("user_id", user.id)
    .single();

  if (!trip) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const { id: placeId, selected } = await req.json();
  if (!placeId || typeof selected !== "boolean") {
    return NextResponse.json({ success: false, error: "id, selected 필요" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("recommended_places")
    .update({ selected })
    .eq("id", placeId)
    .eq("trip_id", tripId)
    .select()
    .single();

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<RecommendedPlace> = { success: true, data };
  return NextResponse.json(body);
}
