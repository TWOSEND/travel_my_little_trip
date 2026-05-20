import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth";
import type { ApiResponse } from "@/app/lib/constants";

export interface ScheduleItem {
  time: string;
  place: string;
  note: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  schedule: ScheduleItem[];
  created_at: string;
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
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

  if (!trip) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("itinerary_days")
    .select("*")
    .eq("trip_id", tripId)
    .order("day_number", { ascending: true });

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<ItineraryDay[]> = { success: true, data: data ?? [] };
  return NextResponse.json(body);
}

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

  if (!trip) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { data: selectedPlaces } = await supabase
    .from("recommended_places")
    .select("name, category")
    .eq("trip_id", tripId)
    .eq("selected", true);

  if (!selectedPlaces || selectedPlaces.length === 0) {
    return NextResponse.json(
      { success: false, error: "선택된 장소가 없습니다. 먼저 장소를 선택하세요." },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "OPENAI_API_KEY가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const days =
    Math.round(
      (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const placeList = selectedPlaces.map((p) => `${p.name}(${p.category})`).join(", ");

  const prompt = `선택한 장소: ${placeList}
여행지: ${trip.destination}, 여행 기간: ${days}일 (${trip.start_date} ~ ${trip.end_date})
일자별 최적 동선으로 일정을 짜줘.
반드시 아래 JSON 형식만 응답해. 다른 텍스트 없이.
{ "days": [{ "day": number, "schedule": [{ "time": string, "place": string, "note": string }] }] }`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let itineraryDays: { day: number; schedule: ScheduleItem[] }[];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw);
    itineraryDays = parsed.days ?? [];
  } catch {
    return NextResponse.json({ success: false, error: "AI 응답 파싱 실패" }, { status: 500 });
  }

  await supabase.from("itinerary_days").delete().eq("trip_id", tripId);

  const rows = itineraryDays.map((d) => ({
    trip_id: tripId,
    day_number: d.day,
    schedule: d.schedule,
  }));

  const { data, error } = await supabase.from("itinerary_days").insert(rows).select();

  if (error) {
    const body: ApiResponse = { success: false, error: error.message };
    return NextResponse.json(body, { status: 500 });
  }

  const body: ApiResponse<ItineraryDay[]> = { success: true, data: data ?? [] };
  return NextResponse.json(body);
}
