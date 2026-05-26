import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

const PLAN_AMOUNTS: Record<string, number> = {
  "월간 플랜": 9900,
  "연간 플랜": 79000,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { paymentId, plan } = await request.json();

  if (!paymentId || !plan) {
    return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
  }

  // PortOne 서버 검증
  const portoneRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
    },
  });

  if (!portoneRes.ok) {
    const body = await portoneRes.text();
    console.error("[verify] portone fetch failed", portoneRes.status, body);
    return NextResponse.json({ success: false, error: "Payment not found" }, { status: 400 });
  }

  const payment = await portoneRes.json();
  console.log("[verify] portone payment", JSON.stringify(payment));

  // 금액 검증
  const expectedAmount = PLAN_AMOUNTS[plan];
  if (!expectedAmount || payment.amount?.total !== expectedAmount || payment.status !== "PAID") {
    console.error("[verify] mismatch", { expectedAmount, actual: payment.amount?.total, status: payment.status });
    return NextResponse.json({ success: false, error: "Payment mismatch" }, { status: 400 });
  }

  // DB 저장
  const adminClient = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await adminClient.from("payments").insert({
    user_id: user.id,
    trip_id: null,
    amount: expectedAmount,
    status: "completed",
  } as any);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
