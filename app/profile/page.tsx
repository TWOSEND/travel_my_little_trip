import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { SignOutButton } from "@/app/dashboard/components/SignOutButton";
import { ProfileForm } from "./components/ProfileForm";

async function getTripCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

async function isPro(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .limit(1);
  return (data?.length ?? 0) > 0;
}

function getInitials(name: string | undefined, email: string): string {
  if (name?.trim()) return name.trim()[0].toUpperCase();
  return email[0].toUpperCase();
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [tripCount, pro] = await Promise.all([
    getTripCount(user.id),
    isPro(user.id),
  ]);

  const displayName: string = user.user_metadata?.display_name ?? "";
  const avatarUrl: string = user.user_metadata?.avatar_url ?? "";
  const joinedAt = new Date(user.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const initials = getInitials(displayName, user.email!);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-[var(--color-foreground)] hover:opacity-70 transition-opacity">
            내 여행
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {user.email}
            </span>
            {pro ? (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}>
                PRO
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-muted-foreground)]">
                FREE
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Avatar + 기본 정보 */}
        <div className="flex items-center gap-5 p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="프로필 이미지" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}
              >
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-[var(--color-foreground)] text-lg leading-tight">
              {displayName || "이름 없음"}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{tripCount}</p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">여행</p>
          </div>
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
            <p className="text-sm font-bold text-[var(--color-foreground)] leading-tight">{pro ? "PRO" : "FREE"}</p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">플랜</p>
          </div>
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
            <p className="text-xs font-bold text-[var(--color-foreground)] leading-tight">{joinedAt}</p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">가입일</p>
          </div>
        </div>

        {/* 프로필 수정 */}
        <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <h2 className="text-base font-semibold text-[var(--color-foreground)] mb-5">프로필 수정</h2>
          <div className="mb-5">
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              이메일
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)] text-sm text-[var(--color-muted-foreground)] cursor-not-allowed"
            />
          </div>
          <ProfileForm
            userId={user.id}
            initials={initials}
            initialDisplayName={displayName}
            initialAvatarUrl={avatarUrl}
          />
        </div>

        {/* 플랜 */}
        {!pro && (
          <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--color-foreground)]">PRO로 업그레이드</p>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">무제한 여행 생성 + AI 추천</p>
            </div>
            <Link
              href="/payment"
              className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)" }}
            >
              업그레이드
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
