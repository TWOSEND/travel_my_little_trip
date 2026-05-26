"use client";

import { useState } from "react";
import { UserManagement } from "./UserManagement";
import { TripManagement } from "./TripManagement";
import { PaymentManagement } from "./PaymentManagement";

const TABS = [
  { key: "users", label: "유저 관리" },
  { key: "trips", label: "트립 관리" },
  { key: "payments", label: "결제 관리" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminDashboard() {
  const [active, setActive] = useState<TabKey>("users");

  return (
    <div>
      <div className="mb-8 flex gap-1 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "users" && <UserManagement />}
      {active === "trips" && <TripManagement />}
      {active === "payments" && <PaymentManagement />}
    </div>
  );
}
