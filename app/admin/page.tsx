import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { AdminDashboard } from "./components/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold text-[var(--color-foreground)]">
            관리자 대시보드
          </span>
          <a
            href="/dashboard"
            className="text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
          >
            대시보드로 이동
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <AdminDashboard />
      </main>
    </div>
  );
}
