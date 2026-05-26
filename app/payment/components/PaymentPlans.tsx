"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { PaymentModal } from "./PaymentModal";

interface Plan {
  label: string;
  amount: number;
  period: string;
  regular: string;
  features: string[];
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    label: "월간 플랜",
    amount: 9900,
    period: "/월",
    regular: "₩19,900",
    features: ["AI 여행 일정 무제한 생성", "PDF 저장·공유", "7일 이내 환불 보장"],
  },
  {
    label: "연간 플랜",
    amount: 79000,
    period: "/년",
    regular: "₩179,000",
    features: ["AI 여행 일정 무제한 생성", "PDF 저장·공유", "7일 이내 환불 보장", "연간 34% 절약"],
    featured: true,
  },
];

export function PaymentPlans() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email ?? "");
      }
    });
  }, []);

  function handlePlanClick(plan: Plan) {
    if (userId) {
      setSelectedPlan(plan);
    } else {
      router.push("/login?redirectTo=/payment");
    }
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-3">
        {/* 무료 플랜 */}
        <PlanCard
          label="무료"
          price="₩0"
          period=""
          features={["AI 여행 일정 월 1회", "기본 일정 저장", "광고 포함"]}
          buttonLabel="무료로 시작하기"
          onButtonClick={() => router.push("/login")}
        />

        {/* 유료 플랜 */}
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.label}
            label={plan.label}
            price={`₩${plan.amount.toLocaleString()}`}
            period={plan.period}
            regular={plan.regular}
            features={plan.features}
            featured={plan.featured}
            buttonLabel="이 플랜으로 시작하기"
            onButtonClick={() => handlePlanClick(plan)}
          />
        ))}
      </div>

      {selectedPlan && userId && (
        <PaymentModal
          plan={selectedPlan}
          userId={userId}
          userEmail={userEmail}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
}

function PlanCard({
  label,
  price,
  period,
  regular,
  features,
  featured = false,
  buttonLabel,
  onButtonClick,
}: {
  label: string;
  price: string;
  period: string;
  regular?: string;
  features: string[];
  featured?: boolean;
  buttonLabel: string;
  onButtonClick: () => void;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 ${
        featured
          ? "border-[var(--color-primary)] shadow-lg shadow-sky-500/10"
          : "border-[var(--color-border)]"
      }`}
    >
      {featured && (
        <span
          className="absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: "var(--color-accent-dark)" }}
        >
          BEST
        </span>
      )}

      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {label}
      </p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight">{price}</span>
        {period && (
          <span className="text-sm text-[var(--color-muted-foreground)]">{period}</span>
        )}
        {regular && (
          <span className="ml-2 text-sm line-through text-[var(--color-muted-foreground)]">{regular}</span>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[var(--color-primary)]" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onButtonClick}
        className={`mt-8 w-full rounded-full py-3 text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 ${
          featured
            ? "bg-[var(--color-primary)] text-white shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/30"
            : "border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
