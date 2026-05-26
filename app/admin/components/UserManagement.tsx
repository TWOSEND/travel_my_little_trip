"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminUser } from "@/app/api/admin/users/route";

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success) setUsers(json.data);
      else setError(json.error ?? "오류가 발생했습니다.");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id: string, payload: Record<string, unknown>) => {
    setUpdating(id);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetchUsers();
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
    return (
      <p className="py-12 text-center text-sm text-red-500">{error}</p>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[var(--color-muted-foreground)]">
        {users.length}명의 유저
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
              <th className="pb-3 pr-4 font-medium">이메일</th>
              <th className="pb-3 pr-4 font-medium">가입일</th>
              <th className="pb-3 pr-4 font-medium">역할</th>
              <th className="pb-3 pr-4 font-medium">상태</th>
              <th className="pb-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--color-border)] last:border-0"
              >
                <td className="py-3 pr-4 text-[var(--color-foreground)]">
                  {user.email}
                </td>
                <td className="py-3 pr-4 text-[var(--color-muted-foreground)]">
                  {new Date(user.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="py-3 pr-4">
                  <select
                    value={user.role}
                    disabled={updating === user.id}
                    onChange={(e) =>
                      updateUser(user.id, { role: e.target.value })
                    }
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-foreground)] disabled:opacity-50"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "활성" : "비활성"}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    disabled={updating === user.id}
                    onClick={() =>
                      updateUser(user.id, { is_active: !user.is_active })
                    }
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] disabled:opacity-50"
                  >
                    {updating === user.id
                      ? "처리중..."
                      : user.is_active
                        ? "비활성화"
                        : "활성화"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
            유저가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
