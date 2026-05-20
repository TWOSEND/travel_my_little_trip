export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14,165,233,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 40%, rgba(245,158,11,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-1.5 text-xs font-semibold text-[var(--color-primary-dark)] shadow-sm backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-primary)" }}
              aria-hidden
            />
            AI가 만드는 나만의 여행 일정
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-6xl">
            여행 계획에 쏟은 시간,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              }}
            >
              이제 여행지에서 쓰세요.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-muted-foreground)] sm:text-xl">
            AI가 <span className="font-semibold text-[var(--color-foreground)]">10분 안에</span>{" "}
            나만을 위한 동선·숙소·맛집 일정을 완성해 드립니다.
            <br className="hidden sm:block" />
            블로그 30개 탭 닫아도 됩니다.
          </p>

          <div className="mt-9 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/login"
              className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-8 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/30 active:translate-y-0 sm:w-auto"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              }}
            >
              지금 무료로 일정 만들기
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
            신용카드 불필요 · 3분이면 첫 일정 완성
          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[var(--color-muted-foreground)]">
            <Stat value="10분" label="평균 일정 생성" />
            <Divider />
            <Stat value="97%" label="시간 절감" />
            <Divider />
            <Stat value="80점+" label="동행자 만족도" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-extrabold text-[var(--color-foreground)]">
        {value}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-4 w-px bg-[var(--color-border)] sm:inline-block"
    />
  );
}
