"use client";

import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";

interface Plan {
  label: string;
  amount: number;
  period: string;
}

interface PaymentModalProps {
  plan: Plan;
  userId: string;
  userEmail: string;
  onClose: () => void;
}

export function PaymentModal({ plan, userId, userEmail, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment() {
    setError(null);
    setLoading(true);

    const paymentId = `payment-${userId}-${Date.now()}`;

    try {
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_TOSS_CHANNEL_KEY!,
        paymentId,
        orderName: `마이리틀트립 ${plan.label}`,
        totalAmount: plan.amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customer: {
          customerId: userId,
          email: userEmail,
        },
      });

      if (response?.code) {
        setError(response.message ?? "결제에 실패했습니다.");
        setLoading(false);
        return;
      }

      // 결제 성공 → 서버 검증
      const verify = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, plan: plan.label }),
      });

      if (!verify.ok) {
        setError("결제 검증에 실패했습니다. 고객센터에 문의해 주세요.");
        setLoading(false);
        return;
      }

      onClose();
      window.location.href = "/dashboard";
    } catch {
      setError("결제 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">결제하기</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            aria-label="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-[var(--color-surface)] p-4">
          <p className="text-sm text-[var(--color-muted-foreground)]">{plan.label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            ₩{plan.amount.toLocaleString()}
            <span className="text-sm font-medium text-[var(--color-muted-foreground)]">{plan.period}</span>
          </p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="mt-6 w-full rounded-full py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
          }}
        >
          {loading ? "결제 진행 중..." : "카드로 결제하기"}
        </button>

        <p className="mt-3 text-center text-xs text-[var(--color-muted-foreground)]">
          토스페이먼츠 · 7일 이내 환불 보장
        </p>
      </div>
    </div>
  );
}
