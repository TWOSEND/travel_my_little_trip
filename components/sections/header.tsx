export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)]/60 bg-[var(--color-background)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <span
            className="grid h-9 w-9 place-items-center rounded-xl text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
            }}
            aria-hidden
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight">
            여행 마이리틀트립
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--color-muted-foreground)] md:flex">
          <a href="#problem" className="transition-colors hover:text-[var(--color-foreground)]">
            문제
          </a>
          <a href="#service" className="transition-colors hover:text-[var(--color-foreground)]">
            서비스
          </a>
          <a href="#testimonials" className="transition-colors hover:text-[var(--color-foreground)]">
            후기
          </a>
          <a href="#pricing" className="transition-colors hover:text-[var(--color-foreground)]">
            가격
          </a>
        </nav>

        <a
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-foreground)] px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          무료 시작
        </a>
      </div>
    </header>
  );
}
