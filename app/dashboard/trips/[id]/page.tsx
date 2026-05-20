import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { SignOutButton } from "@/app/dashboard/components/SignOutButton";
import { TodoList } from "./components/TodoList";
import { PlaceRecommend } from "./components/PlaceRecommend";
import type { Trip } from "@/app/api/trips/route";
import type { Todo } from "@/app/api/trips/[id]/todos/route";
import type { RecommendedPlace } from "@/app/api/trips/[id]/recommend/route";

async function getTrip(id: string, userId: string): Promise<Trip | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  return data ?? null;
}

async function getTodos(tripId: string): Promise<Todo[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("todos")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

async function getPlaces(tripId: string): Promise<RecommendedPlace[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recommended_places")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const [trip, todos, places] = await Promise.all([
    getTrip(id, user.id),
    getTodos(id),
    getPlaces(id),
  ]);

  if (!trip) notFound();

  const nights = Math.round(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              ← 내 여행
            </Link>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-sm font-medium text-[var(--color-foreground)] truncate max-w-[200px]">
              {trip.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)]">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{trip.title}</h1>
          <p className="text-[var(--color-muted-foreground)] mt-1">{trip.destination}</p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            {trip.start_date} ~ {trip.end_date} ({nights}박 {nights + 1}일)
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--color-foreground)] mb-4">
            Todo 리스트
          </h2>
          <TodoList tripId={id} initialTodos={todos} />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="text-base font-semibold text-[var(--color-foreground)] mb-2">
            AI 장소 추천
          </h2>
          <PlaceRecommend tripId={id} initialPlaces={places} />
        </div>
      </main>
    </div>
  );
}
