"use client";

import { useState } from "react";
import type { RecommendedPlace } from "@/app/api/trips/[id]/recommend/route";

const CATEGORY_COLORS: Record<string, string> = {
  관광: "bg-blue-100 text-blue-700",
  음식: "bg-orange-100 text-orange-700",
  쇼핑: "bg-pink-100 text-pink-700",
  숙박: "bg-purple-100 text-purple-700",
  자연: "bg-green-100 text-green-700",
  문화: "bg-yellow-100 text-yellow-700",
  액티비티: "bg-red-100 text-red-700",
};

interface Props {
  tripId: string;
  initialPlaces: RecommendedPlace[];
}

export function PlaceRecommend({ tripId, initialPlaces }: Props) {
  const [places, setPlaces] = useState<RecommendedPlace[]>(initialPlaces);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecommend() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/trips/${tripId}/recommend`, { method: "POST" });
    const json = await res.json();

    if (json.success) {
      setPlaces(json.data);
    } else {
      setError(json.error ?? "오류가 발생했습니다.");
    }
    setLoading(false);
  }

  async function handleToggle(place: RecommendedPlace) {
    const res = await fetch(`/api/trips/${tripId}/recommend`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: place.id, selected: !place.selected }),
    });
    const json = await res.json();
    if (json.success) {
      setPlaces((prev) => prev.map((p) => (p.id === place.id ? json.data : p)));
    }
  }

  const selectedCount = places.filter((p) => p.selected).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {places.length > 0
            ? `${places.length}곳 추천됨 · ${selectedCount}곳 선택`
            : "AI가 여행지에 맞는 장소를 추천해드립니다."}
        </p>
        <button
          onClick={handleRecommend}
          disabled={loading}
          className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-accent-foreground)] text-sm font-medium hover:bg-[var(--color-accent-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "추천 중..." : places.length > 0 ? "다시 추천받기" : "장소 추천받기"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {places.map((place) => (
            <button
              key={place.id}
              onClick={() => handleToggle(place)}
              className={`text-left p-4 rounded-[var(--radius-md)] border transition-all ${
                place.selected
                  ? "border-[var(--color-primary)] bg-blue-50 shadow-sm"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-[var(--color-foreground)]">{place.name}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    CATEGORY_COLORS[place.category] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {place.category}
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1 line-clamp-2">
                {place.description}
              </p>
              {place.selected && (
                <p className="text-xs text-[var(--color-primary)] mt-2 font-medium">✓ 선택됨</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
