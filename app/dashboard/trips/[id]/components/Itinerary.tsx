"use client";

import { useState } from "react";
import type { ItineraryDay } from "@/app/api/trips/[id]/itinerary/route";

interface Props {
  tripId: string;
  initialDays: ItineraryDay[];
}

export function Itinerary({ tripId, initialDays }: Props) {
  const [days, setDays] = useState<ItineraryDay[]>(initialDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/trips/${tripId}/itinerary`, { method: "POST" });
    const json = await res.json();

    if (json.success) {
      setDays(json.data);
    } else {
      setError(json.error ?? "오류가 발생했습니다.");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {days.length > 0
            ? `${days.length}일 일정 생성됨`
            : "선택한 장소 기반으로 일정을 생성합니다."}
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "생성 중..." : days.length > 0 ? "일정 다시 생성" : "일정 생성하기"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {days.length > 0 && (
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day.id}>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
                Day {day.day_number}
              </h3>
              <div className="space-y-2">
                {day.schedule.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 shrink-0" />
                      {idx < day.schedule.length - 1 && (
                        <div className="w-px flex-1 bg-[var(--color-border)] mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-[var(--color-muted-foreground)] w-12 shrink-0">
                          {item.time}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-foreground)]">
                          {item.place}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 ml-14">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
