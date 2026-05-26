"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminPayment, PaymentsResponse } from "@/app/api/admin/payments/route";

function statusBadge(status: AdminPayment["status"]) {
  if (status === "completed") return { label: "완료", cls: "bg-green-100 text-green-700" };
  if (status === "refunded") return { label: "환불", cls: "bg-orange-100 text-orange-700" };
  return { label: "대기", cls: "bg-gray-100 text-gray-600" };
}

export function PaymentManagement() {
  const [data, setData] = useState<PaymentsResponse>({ payments: [], revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/payments?${params}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error ?? "오류가 발생했습니다.");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refund = async (id: string) => {
    if (!confirm("환불 처리하시겠습니까?")) return;
    setUpdating(id);
    await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "refunded" }),
    });
    await fetchPayments();
    setUpdating(null);
  };

  return (
    <div>
      {/* 기간 필터 */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">
            시작일
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-foreground)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-muted-foreground)]">
            종료일
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-foreground)]"
          />
        </div>
        {(from || to) && (
          <button
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="py-1.5 text-sm text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
          >
            초기화
          </button>
        )}
      </div>

      {/* 매출 합계 */}
      <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)] px-5 py-4">
        <p className="mb-1 text-xs text-[var(--color-muted-foreground)]">
          완료 매출 합계
        </p>
        <p className="text-2xl font-bold text-[var(--color-foreground)]">
          ₩{data.revenue.toLocaleString("ko-KR")}
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          {data.payments.filter((p) => p.status === "completed").length}건 기준
        </p>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
          불러오는 중...
        </p>
      ) : error ? (
        <p className="py-12 text-center text-sm text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
                <th className="pb-3 pr-4 font-medium">유저</th>
                <th className="pb-3 pr-4 font-medium">여행</th>
                <th className="pb-3 pr-4 font-medium">금액</th>
                <th className="pb-3 pr-4 font-medium">상태</th>
                <th className="pb-3 pr-4 font-medium">결제일</th>
                <th className="pb-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((payment) => {
                const { label, cls } = statusBadge(payment.status);
                return (
                  <tr
                    key={payment.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="max-w-[160px] truncate py-3 pr-4 text-[var(--color-foreground)]">
                      {payment.user_email}
                    </td>
                    <td className="max-w-[120px] truncate py-3 pr-4 text-[var(--color-muted-foreground)]">
                      {payment.trip_title}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 font-medium text-[var(--color-foreground)]">
                      ₩{payment.amount.toLocaleString("ko-KR")}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-[var(--color-muted-foreground)]">
                      {new Date(payment.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="py-3">
                      {payment.status === "completed" && (
                        <button
                          disabled={updating === payment.id}
                          onClick={() => refund(payment.id)}
                          className="rounded-[var(--radius-sm)] border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50"
                        >
                          {updating === payment.id ? "처리중..." : "환불"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.payments.length === 0 && (
            <p className="py-12 text-center text-sm text-[var(--color-muted-foreground)]">
              결제 내역이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
