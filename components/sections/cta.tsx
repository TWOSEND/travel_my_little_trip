const benefits = [
  "7일 이내 환불 보장",
  "생성한 일정 PDF 저장·공유 무제한",
  "모든 플랜 즉시 이용 가능",
];

export function CTA() {
  return (
    <section id="cta" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div
          className="relative overflow-hidden rounded-[2rem] p-8 shadow-2xl sm:p-14"
          style={{
            background:
              "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 100% 0%, rgba(245,158,11,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(14,165,233,0.3) 0%, transparent 60%)",
            }}
          />

          <div className="relative">
            <div className="text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#fbbf24",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                얼리버드 한정 · 7일 후 종료
              </span>

              <h2 id="pricing" className="mt-6 text-3xl font-extrabold text-white sm:text-5xl">
                여행 계획,
                <br />
                오늘이 가장 저렴한 날입니다.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              <PricingCard
                label="월간 플랜"
                regular="₩19,900"
                now="₩9,900"
                period="/월"
              />
              <PricingCard
                label="연간 플랜"
                regular="₩179,000"
                now="₩79,000"
                period="/년"
                featured
              />
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/90 backdrop-blur"
                >
                  <span
                    className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full"
                    style={{ background: "var(--color-accent)" }}
                    aria-hidden
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center gap-3">
              <a
                href="/payment"
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-10 text-base font-bold shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 sm:w-auto"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                  color: "var(--color-accent-foreground)",
                }}
              >
                지금 시작하기
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  label,
  regular,
  now,
  period,
  featured = false,
}: {
  label: string;
  regular: string;
  now: string;
  period: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 ${
        featured
          ? "bg-white text-[var(--color-foreground)] ring-2 ring-amber-400"
          : "bg-white/10 text-white backdrop-blur"
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
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider opacity-80">
          {label}
        </span>
        <span
          className={`text-sm line-through ${
            featured ? "text-slate-400" : "text-white/50"
          }`}
        >
          {regular}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight">{now}</span>
        <span
          className={`text-sm font-medium ${
            featured ? "text-slate-500" : "text-white/70"
          }`}
        >
          {period}
        </span>
      </div>
    </div>
  );
}
