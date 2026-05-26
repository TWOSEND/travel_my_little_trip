import { PaymentPlans } from "./components/PaymentPlans";

export default function PaymentPage() {
  return (
    <main className="min-h-screen py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            플랜 선택
          </h1>
          <p className="mt-3 text-[var(--color-muted-foreground)]">
            지금 시작하면 얼리버드 가격으로 이용하실 수 있습니다.
          </p>
        </div>

        <PaymentPlans />

        <p className="mt-8 text-center text-sm text-[var(--color-muted-foreground)]">
          결제 관련 문의:{" "}
          <a href="mailto:greyzerocompany@gmail.com" className="underline hover:text-[var(--color-foreground)]">
            greyzerocompany@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
