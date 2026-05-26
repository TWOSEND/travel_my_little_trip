"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminTrip } from "@/app/api/admin/trips/route";

export function TripManagement() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/trips");
      const json = await res.json();
      if (json.success) setTrips(json.data);
      else setError(json.error ?? "오류가 발생했습니다.");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const togglePublic = async (trip: AdminTrip) => {
    setUpdating(trip.id);
    await fetch(`/api/admin/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: !trip.is_public }),
    });
    await fetchTrips();
    setUpdating(null);
  };

  const deleteTrip = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setUpdating(id);
    await fetch(`/api/admin/trips/${id}`, { method: "DELETE" });
    await fetchTrips();
    setUpdating(null);
  };

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
        불러오는 중...
      </p>
    );
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-red-500">{error}</p>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[var(--color-muted-foreground)]">
        {trips.length}개의 트립
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
              <th className="pb-3 pr-4 font-medium">제목</th>
              <th className="pb-3 pr-4 font-medium">목적지</th>
              <th className="pb-3 pr-4 font-medium">유저</th>
              <th className="pb-3 pr-4 font-medium">기간</th>
              <th className="pb-3 pr-4 font-medium">공개</th>
              <th className="pb-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr
                key={trip.id}
                className="border-b border-[var(--color-border)] last:border-0"
              >
                <td className="max-w-[140px] truncate py-3 pr-4 text-[var(--color-foreground)]">
                  {trip.title}
                </td>
                <td className="max-w-[100px] truncate py-3 pr-4 text-[var(--color-muted-foreground)]">
                  {trip.destination}
                </td>
                <td className="max-w-[160px] truncate py-3 pr-4 text-[var(--color-muted-foreground)]">
                  {trip.user_email}
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-[var(--color-muted-foreground)]">
                  {trip.start_date} ~ {trip.end_date}
                </td>
                <td className="py-3 pr-4">
                  <button
                    disabled={updating === trip.id}
                    onClick={() => togglePublic(trip)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      trip.is_public
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {trip.is_public ? "공개" : "비공개"}
                  </button>
                </td>
                <td className="py-3">
                  <button
                    disabled={updating === trip.id}
                    onClick={() => deleteTrip(trip.id)}
                    className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    {updating === trip.id ? "처리중..." : "삭제"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trips.length === 0 && (
          <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
            트립이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
