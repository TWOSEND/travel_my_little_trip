"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

interface ProfileFormProps {
  userId: string;
  initials: string;
  initialDisplayName: string;
  initialAvatarUrl: string;
}

export function ProfileForm({
  userId,
  initials,
  initialDisplayName,
  initialAvatarUrl,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [avatarStatus, setAvatarStatus] = useState<"idle" | "uploading" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarStatus("error");
      setTimeout(() => setAvatarStatus("idle"), 3000);
      return;
    }

    setAvatarStatus("uploading");
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setAvatarStatus("error");
      setTimeout(() => setAvatarStatus("idle"), 3000);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl;

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: publicUrl }),
    });

    if (res.ok) {
      setAvatarUrl(publicUrl);
      setAvatarStatus("idle");
      router.refresh();
    } else {
      setAvatarStatus("error");
      setTimeout(() => setAvatarStatus("idle"), 3000);
    }

    e.target.value = "";
  }

  async function handleNameSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setNameStatus("saving");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName }),
    });

    setNameStatus(res.ok ? "saved" : "error");
    setTimeout(() => setNameStatus("idle"), 2000);
  }

  return (
    <div className="space-y-6">
      {/* 아바타 업로드 */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarStatus === "uploading"}
          className="relative group w-20 h-20 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2"
          aria-label="프로필 이미지 변경"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}
            >
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
            {avatarStatus === "uploading" ? (
              <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
        </button>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {avatarStatus === "uploading"
            ? "업로드 중…"
            : avatarStatus === "error"
            ? "업로드 실패 (최대 2MB, 이미지만)"
            : "클릭해서 이미지 변경"}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* 이름 수정 */}
      <form onSubmit={handleNameSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            이름
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="표시 이름 입력"
            className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={nameStatus === "saving" || displayName.trim().length === 0}
            className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {nameStatus === "saving" ? "저장 중…" : "저장"}
          </button>
          {nameStatus === "saved" && (
            <span className="text-sm text-emerald-600">저장됐습니다.</span>
          )}
          {nameStatus === "error" && (
            <span className="text-sm text-red-500">저장 실패. 다시 시도해주세요.</span>
          )}
        </div>
      </form>
    </div>
  );
}
