# AI 여행 계획 서비스 — 기획 & 구현 계획

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 |
| DB / Auth | Supabase |
| 스타일 | Tailwind CSS 4 |
| AI | OpenAI API (gpt-4o) |
| 언어 | TypeScript |

---

## DB 스키마

```sql
-- 여행
trips (
  id uuid PK,
  user_id uuid FK → auth.users,
  title text,
  destination text,
  start_date date,
  end_date date,
  created_at timestamptz
)

-- Todo
todos (
  id uuid PK,
  trip_id uuid FK → trips,
  content text,
  done boolean DEFAULT false,
  created_at timestamptz
)

-- AI 추천 장소
recommended_places (
  id uuid PK,
  trip_id uuid FK → trips,
  name text,
  description text,
  category text,
  selected boolean DEFAULT false,
  created_at timestamptz
)

-- AI 생성 일정
itinerary_days (
  id uuid PK,
  trip_id uuid FK → trips,
  day_number int,
  schedule jsonb,  -- [{ time, place, note }]
  created_at timestamptz
)
```

RLS: 모든 테이블 `user_id = auth.uid()` 기준 본인 데이터만 접근.

---

## 화면 구조

```
/ (랜딩 — 완성)
/login          → 이메일+비밀번호 로그인
/signup         → 이메일+비밀번호 회원가입
/dashboard      → 내 여행 목록 (카드 그리드)
/dashboard/trips/new       → 여행 생성 폼
/dashboard/trips/[id]      → 여행 상세
  └─ 탭 1: Todo 리스트
  └─ 탭 2: AI 장소 추천 → 선택 → 일정 생성
```

---

## 구현 단계

### ✅ STEP 0 — 랜딩 페이지
- 완성
- CTA 버튼 전체 `/login` 연결

### ✅ STEP 1 — 로그인 / 회원가입
- `app/(auth)/login/page.tsx` — 완성
- `app/(auth)/signup/page.tsx` — 완성
- Supabase `signInWithPassword` / `signUp` 사용
- **Supabase Dashboard 수동 설정 필요**: Authentication → Settings → Confirm email **OFF**

### 🔲 STEP 2 — 여행 목록 / 생성

**파일:**
- `app/dashboard/page.tsx` — 여행 카드 목록 (Server Component)
- `app/dashboard/trips/new/page.tsx` — 여행 생성 폼
- `app/api/trips/route.ts` — GET(목록) / POST(생성)
- `supabase/migrations/001_trips.sql` — trips 테이블 + RLS

**동작:**
1. dashboard → Supabase에서 `trips` SELECT → 카드 렌더링
2. new → 제목/목적지/날짜 입력 → POST /api/trips → 여행 상세로 이동

### 🔲 STEP 3 — Todo 리스트

**파일:**
- `app/dashboard/trips/[id]/page.tsx` — 여행 상세 (탭 UI)
- `app/dashboard/trips/[id]/components/TodoList.tsx` — 클라이언트 컴포넌트
- `app/api/trips/[id]/todos/route.ts` — GET / POST / PATCH(done 토글) / DELETE
- `supabase/migrations/002_todos.sql` — todos 테이블 + RLS

**동작:**
1. Todo 입력 → POST → 목록 리렌더
2. 체크박스 → PATCH done 토글
3. 삭제 버튼 → DELETE

### 🔲 STEP 4 — AI 장소 추천

**파일:**
- `app/dashboard/trips/[id]/components/PlaceRecommend.tsx`
- `app/api/trips/[id]/recommend/route.ts` — OpenAI 호출
- `supabase/migrations/003_recommended_places.sql`

**동작:**
1. "장소 추천받기" 버튼 → POST /api/trips/[id]/recommend
2. 서버에서 OpenAI gpt-4o 호출 (여행지/날짜 컨텍스트)
3. 응답 파싱 → recommended_places INSERT
4. 카드 렌더링 + 사용자 선택(체크) → selected UPDATE

**프롬프트:**
```
목적지: {destination}, 기간: {start_date} ~ {end_date}
위 여행에 적합한 장소 10곳을 추천해줘.
JSON 배열: [{ name, description, category }]
```

### 🔲 STEP 5 — AI 일정 생성

**파일:**
- `app/dashboard/trips/[id]/components/Itinerary.tsx`
- `app/api/trips/[id]/itinerary/route.ts` — OpenAI 호출
- `supabase/migrations/004_itinerary.sql`

**동작:**
1. 선택된 장소 기반 → POST /api/trips/[id]/itinerary
2. OpenAI gpt-4o → 일자별 일정 JSON 생성
3. itinerary_days INSERT
4. 타임라인 UI 렌더링

**프롬프트:**
```
선택한 장소: {selected_places}
여행 기간: {days}일
일자별 최적 동선으로 일정을 짜줘.
JSON: { day: number, schedule: [{ time, place, note }] }[]
```

---

## 환경 변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
OPENAI_API_KEY=
CORS_ORIGIN=http://localhost:3000
```

---

## 주요 규칙

- `middleware.ts` 사용 금지 → `proxy.ts` 사용 (Next.js 16)
- 인증 게이팅: `proxy.ts`에서 처리 (수정 불필요)
- Supabase browser client: `app/lib/supabase/client.ts`
- Supabase server client: `app/lib/supabase/server.ts`
- Admin client (RLS 우회): `app/lib/supabase/admin.ts`
