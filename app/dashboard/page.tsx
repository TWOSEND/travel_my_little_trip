import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { SignOutButton } from "./components/SignOutButton";
import type { Trip } from "@/app/api/trips/route";

async function getTrips(userId: string): Promise<Trip[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const trips = user ? await getTrips(user.id) : [];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-[var(--color-foreground)]">내 여행</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">여행 목록</h1>
          <Link
            href="/dashboard/trips/new"
            className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            + 새 여행
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-4xl mb-4">✈️</p>
            <p className="text-[var(--color-muted-foreground)] text-sm">
              아직 여행이 없습니다.
            </p>
            <Link
              href="/dashboard/trips/new"
              className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
            >
              첫 여행을 만들어보세요
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/dashboard/trips/${trip.id}`}
                className="block p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-[var(--color-foreground)] truncate">
                  {trip.title}
                </p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1 truncate">
                  {trip.destination}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-3">
                  {trip.start_date} ~ {trip.end_date}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
