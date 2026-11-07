# 상식 퀴즈 게임 - 2단계 (서버 + 순위표)

## 📋 프로젝트 개요

1단계의 클라이언트 기반 상식 퀴즈 게임에 서버와 순위표 시스템을 추가했습니다.

### 주요 기능
- ✅ 41개 문제를 서버에서 제공 (정답 미노출)
- ✅ 서버에서 정답 판정 (부정행위 방지)
- ✅ 순위표 시스템
- ✅ 세션 저장 및 복구
- ✅ 신속한 답변 조회 및 통합 테스트
- ✅ 커스텀 명령어로 문제 자동 생성 및 관리

## 🏗️ 프로젝트 구조

```
Study-03/
├── apps/
│   ├── web/              # React 프론트엔드
│   │   ├── src/
│   │   │   ├── data/questions.json     # 문제 데이터 (41개)
│   │   │   ├── features/quiz/          # 게임 로직
│   │   │   └── components/screens/     # UI 컴포넌트
│   │   └── package.json
│   └── server/           # Node.js + Hono 백엔드
│       ├── src/
│       │   ├── db/       # 데이터베이스 초기화, 스키마
│       │   ├── routes/   # API 엔드포인트
│       │   ├── services/ # 비즈니스 로직
│       │   ├── middleware/# Rate limiting, CORS
│       │   ├── utils/    # 헬퍼 함수
│       │   └── app.ts    # Hono 앱
│       ├── seeds/        # DB 초기화 스크립트
│       └── package.json
├── .claude/
│   └── commands/         # 커스텀 명령어 모음
│       ├── quiz-add.ps1/.cmd/.md    # 문제 자동 생성 및 추가
│       ├── quiz-validate.ps1/.cmd/.md # 문제 검증 (최상급 표현 등)
│       └── quiz-range.ps1/.cmd/.md    # 범위별 문제 검토 (분포 분석)
├── package.json          # 모노레포 루트
└── README.md            # 이 파일
```

## 🚀 로컬 실행 방법

### 1단계: 의존성 설치

```bash
# 루트 디렉토리에서
npm install
```

### 2단계: 데이터베이스 초기화

```bash
# 서버 디렉토리에서 questions.json → SQLite 마이그레이션
npm run seed
```

이 명령은:
- `quiz.db` SQLite 데이터베이스 생성
- 41개 문제를 DB에 저장

### 3단계: 개발 서버 실행

**터미널 1: 백엔드 서버**
```bash
npm run dev:server
# 포트 3000에서 실행됨: http://localhost:3000
```

**터미널 2: 프론트엔드 (Vite)**
```bash
npm run dev:web
# 포트 5173에서 실행됨: http://localhost:5173
```

### 4단계: 브라우저에서 확인

```
http://localhost:5173
```

## 🎮 커스텀 명령어

프로젝트에는 퀴즈 문제 관리를 위한 자동화된 명령어가 포함되어 있습니다.

### 1️⃣ 문제 추가 (`/quiz-add`)

Claude가 자동으로 새로운 문제를 생성하고 `questions.json`에 추가합니다.

**사용법**:
```bash
# 역사 카테고리, 중간 난이도 문제 추가
/quiz-add 역사 중간

# 과학 카테고리, 어려움 난이도 문제 추가
/quiz-add 과학 어려움

# 영문으로도 가능
/quiz-add history medium
/quiz-add science hard
```

**유효한 입력값**:
| 카테고리 | 난이도 |
|---------|--------|
| 역사 (history) | 쉬움 (easy) |
| 과학 (science) | 중간 (medium) |
| 지리 (geography) | 어려움 (hard) |
| 일반 (general) | |

**특징**:
- ✅ 자동 ID 생성 (예: history_011)
- ✅ 검증 가이드라인 자동 적용 (최상급 표현, 시간/범위 명시 등)
- ✅ 정답 분포 균형 목표 (선택지 1, 2, 3번 우선 배치)
- ✅ 기존 문제와 중복 확인

### 2️⃣ 문제 검증 (`/quiz-validate`)

퀴즈 문제들의 품질을 검증합니다.

**사용법**:
```bash
# 전체 문제 검증
/quiz-validate

# 특정 카테고리만 검증
/quiz-validate history

# 또는
/quiz-validate 역사
```

**확인 항목**:
- ✅ 최상급 표현 (가장, 최초, 최대 등)에 기준이 명시되어 있는가?
- ✅ 시간과 범위가 명확한가?
- ✅ 정답이 명확한가?

### 3️⃣ 범위 검토 (`/quiz-range`)

특정 범위의 문제들을 검토하고 난이도, 카테고리, 정답 분포를 분석합니다.

**사용법**:
```bash
# 1번부터 10번까지 검토
/quiz-range 1 10

# 21번부터 40번까지 검토
/quiz-range 21 40

# 모든 문제 분석
/quiz-range 1 41
```

**분석 항목**:
- 📊 난이도 분포 (쉬움/중간/어려움)
- 📊 카테고리 분포
- 📊 정답 선택지 분포 (0~3번)
- ⚠️ 정답 편중 경고 (50% 이상 한 선택지에 집중)

### 🎯 정답 분포 현황

**현재 상태** (41개 문제):
- 선택지 0번: ~85% (35개) - ⚠️ 높음
- 선택지 1번: ~7% (3개)
- 선택지 2번: ~5% (2개)  
- 선택지 3번: ~3% (1개)

**목표 상태**:
- 선택지 0번: 25% (10개)
- 선택지 1번: 25% (10개)
- 선택지 2번: 25% (10개)
- 선택지 3번: 25% (10개)

**균형 달성 방법**:
1. `/quiz-add` 명령어로 새 문제 추가
2. Claude가 자동으로 선택지 1, 2, 3번에 정답 배치
3. 반복하면 정답 분포가 균형잡힘

---

## 🧪 테스트 실행

### API 통합 테스트

```bash
npm run test:integration
```

테스트 항목:
- ✅ 세션 생성 및 검증 (닉네임 유효성)
- ✅ 정답 판정 정확성
- ✅ 중복 제출 거부
- ✅ 순위 정렬 규칙 (점수 → 시간 → 등록순)
- ✅ 정답 미노출 확인
- ✅ 카테고리별 점수 계산

## 🔌 API 명세

### 기본 정보
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **Rate Limit**: 60초당 30요청 (IP 기준)

### Sessions API

#### `POST /api/sessions`
**새 게임 세션 생성**

**Request:**
```json
{
  "nickname": "플레이어1"
}
```

**Response (201):**
```json
{
  "sessionId": "sess_abc123...",
  "questions": [
    {
      "id": "history_001",
      "category": "history",
      "question": "조선 건국자는 누구인가?",
      "choices": ["이성계", "정도전", "태종", "세종"],
      "difficulty": "easy"
    },
    // ... 40개 문제
  ]
}
```

**Validation Errors (400):**
- `nickname` 길이 1-20자
- 비속어 필터

---

#### `GET /api/sessions/:id`
**세션 상태 조회 (새로고침 후 복구)**

**Response (200):**
```json
{
  "sessionId": "sess_abc123...",
  "nickname": "플레이어1",
  "status": "active",
  "currentQuestionIndex": 5,
  "answeredCount": 5,
  "totalScore": 150,
  "questions": [...]
}
```

### Answers API

#### `POST /api/sessions/:id/answers`
**문제 답변 제출 및 판정**

**Request:**
```json
{
  "questionId": "history_001",
  "answerIndex": 0,
  "timeSpent": 12
}
```

**Response (200):**
```json
{
  "isCorrect": true,
  "correctIndex": 0,
  "explanation": "이성계는 1392년 조선을 건국했습니다.",
  "points": 10,
  "feedback": {
    "totalCorrect": 5,
    "currentScore": 150
  }
}
```

**Errors:**
- `400`: 세션/문제가 유효하지 않음
- `409`: 이미 제출한 문제 (중복)
- `429`: Rate limit 초과

---

#### `POST /api/sessions/:id/finish`
**게임 완료 및 순위표 기록**

**Request:**
```json
{}
```

**Response (201):**
```json
{
  "success": true,
  "totalScore": 350,
  "totalTime": 1245,
  "categoryScores": {
    "history": 80,
    "science": 90,
    "geography": 100,
    "general": 80
  },
  "rank": 42,
  "leaderboardId": "lb_xyz789...",
  "message": "42등입니다! 축하합니다!"
}
```

### Leaderboard API

#### `GET /api/leaderboard?limit=100`
**상위 순위 조회**

**Response (200):**
```json
{
  "entries": [
    {
      "rank": 1,
      "nickname": "슈퍼플레이어",
      "totalScore": 400,
      "totalTime": 900,
      "categoryScores": {...},
      "createdAt": "2024-11-08T10:30:00Z"
    }
    // ... 최대 100개
  ],
  "timestamp": "2024-11-08T15:22:00Z"
}
```

**Query Parameters:**
- `limit`: 최대 개수 (기본값 100, 최대 100)

---

#### `GET /api/leaderboard/me?sessionId=...`
**내 순위 및 주변 사람들**

**Query Parameters:**
- `sessionId`: 필수

**Response (200):**
```json
{
  "myEntry": {
    "rank": 42,
    "nickname": "플레이어1",
    "totalScore": 350,
    "totalTime": 1245,
    "categoryScores": {...},
    "createdAt": "2024-11-08T14:00:00Z"
  },
  "aroundMe": [
    { "rank": 40, ... },
    { "rank": 41, ... },
    { "rank": 42, "nickname": "플레이어1", ... },  // 자신
    { "rank": 43, ... },
    { "rank": 44, ... }
  ]
}
```

## ⚙️ 환경 설정

### `.env` 파일 생성

`apps/server/.env.example`을 참고해 `.env` 파일을 생성하세요:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=file:./quiz.db

# Frontend
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=30
MAX_ANSWERS_PER_SECOND=5

# Validation
MAX_NICKNAME_LENGTH=20
MIN_NICKNAME_LENGTH=1
```

## 🛡️ 부정행위 방지

### 1. 정답 미노출
- 답변 제출 전에는 `answerIndex`, `explanation` 절대 전송 안 함
- 세션 `status='active'`일 때만 정답 제외

### 2. 서버 점수 계산
- 클라이언트 점수 무시
- `session_answers` 테이블에서 서버가 계산
- 점수 규칙: 정답 시 10점 × 어려움도 계수

### 3. 중복 제출 방지
- `session_answers` 테이블에 UNIQUE 제약 (session_id, question_id)
- 두 번째 제출 시 409 Conflict 반환

### 4. Rate Limiting
- IP/세션 기준 요청 빈도 제한
- 답변 제출은 5초당 1회로 엄격히 제한
- 초과 시 429 + Retry-After 헤더

### 5. 닉네임 검증
- 길이: 1-20자
- 비속어 필터 적용

## 📊 데이터베이스 스키마

### questions
```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  category TEXT,        -- history, science, geography, general
  question TEXT,
  choices JSON,         -- ["선택1", "선택2", ...]
  answerIndex INTEGER,  -- 0-3 (서버만 보유)
  explanation TEXT,
  difficulty TEXT,      -- easy, medium, hard
  source TEXT
);
```

### sessions
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  nickname TEXT,
  status TEXT,          -- active, completed
  total_score INTEGER,
  total_time INTEGER,   -- 초 단위
  category_scores JSON, -- {"history": 80, ...}
  question_ids JSON,    -- 이 세션의 40개 문제 ID
  created_at DATETIME,
  completed_at DATETIME
);
```

### session_answers
```sql
CREATE TABLE session_answers (
  id INTEGER PRIMARY KEY,
  session_id TEXT,
  question_id TEXT,
  answer_index INTEGER,  -- 플레이어 답변
  time_spent INTEGER,    -- 초 단위
  is_correct BOOLEAN,
  points_earned INTEGER,
  answered_at DATETIME,
  UNIQUE (session_id, question_id) -- 중복 방지
);
```

### leaderboard
```sql
CREATE TABLE leaderboard (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE,
  nickname TEXT,
  total_score INTEGER,
  total_time INTEGER,
  category_scores JSON,
  created_at DATETIME
);
-- 인덱스: (total_score DESC, total_time ASC, created_at ASC)
```

## 🔧 개발 명령어

```bash
# 모든 워크스페이스 개발 서버 실행
npm run dev

# 개별 실행
npm run dev:web       # 프론트엔드만
npm run dev:server    # 백엔드만

# DB 초기화
npm run seed

# 테스트
npm run test          # 모든 워크스페이스 테스트
npm run test:integration  # 서버 API 통합 테스트

# 빌드
npm run build
```

## 📝 점수 계산

- **기본 점수**: 정답 시 10점 × 난이도 계수
  - `easy`: 10점
  - `medium`: 12점
  - `hard`: 15점
- **카테고리별 점수**: 카테고리당 정답 비율 (0-100%)
- **최대 총점**: 400점 (게임마다 40개 문제 선택 × 10점 기본값)
- **문제 풀**: 41개 문제 (지속적으로 추가 예정)

## 🎯 순위 정렬 규칙

1. **점수 높은 순** (내림차순)
2. **같은 점수면 소요 시간 짧은 순** (오름차순)
3. **그래도 같으면 먼저 제출한 순** (오름차순)

## 🐛 문제 해결

### 데이터베이스 초기화 오류
```bash
# quiz.db 삭제 후 재생성
rm apps/server/quiz.db
npm run seed
```

### 포트 이미 사용 중
```bash
# 다른 포트로 실행
PORT=3001 npm run dev:server
```

### CORS 오류
- `.env`의 `ALLOWED_ORIGINS` 확인
- 프론트엔드 URL이 포함되어 있는지 확인

## 📚 참고 자료

- [Hono 공식 문서](https://hono.dev)
- [better-sqlite3 문서](https://github.com/WiseLibs/better-sqlite3)
- [Vite 공식 문서](https://vitejs.dev)

---

## 📖 주요 변경 사항

### v0.2.0 (2026-11-08)
- ✅ 커스텀 명령어 추가 (`/quiz-add`, `/quiz-validate`, `/quiz-range`)
- ✅ Claude 자동 문제 생성 기능
- ✅ 검증 가이드라인 자동 적용
- ✅ 정답 분포 분석 및 균형 목표 제시
- ✅ 문제 검증 및 범위 검토 기능

### v0.1.0 (2026-11-01)
- ✅ 기본 게임 시스템 (40개 문제)
- ✅ 서버 기반 정답 판정
- ✅ 순위표 시스템
- ✅ API 통합 테스트

---

**최종 업데이트**: 2026-11-08
