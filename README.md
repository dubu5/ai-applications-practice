# VibeCoding 프로젝트 모음

학습과 실무를 위한 세 가지 프로젝트를 진행 중입니다.

## 프로젝트 구조

```
VibeCoding/
├── Study-01/          # 손글씨 숫자 인식 (Desktop & Web)
├── Study-02/          # 할 일 관리 앱 (TODO App)
└── Study-03/          # 상식 퀴즈 게임 (React + Node.js)
```

---

## Study-01: 손글씨 숫자 인식 앱

AI가 손글씨로 그린 숫자(0-9)를 인식하는 애플리케이션

### 개요
- 모델: CNN (Convolutional Neural Network) - MNIST 훈련
- 정확도: ~98-99%
- 버전: 2가지 (Desktop + Web)

### 주요 기능
| 버전 | 기술 스택 | 특징 |
|------|---------|------|
| Desktop | Python + Tkinter | GUI 기반, 로컬 실행 |
| Web | Flask + Canvas API | 브라우저 기반, 모바일 지원 |

### 실행
```bash
# Desktop
cd Study-01/desktop_version
python digit_recognition.py

# Web
cd Study-01/web_version/backend
python app.py  # http://localhost:5000
```

---

## Study-02: 할 일 관리 앱

일일 작업을 관리하는 TODO 애플리케이션

### 개요
- 목적: 효율적인 작업 관리
- 구조: 클라이언트 기반 앱

### 주요 기능
- 할 일 추가/삭제
- 우선순위 관리
- 진행 상태 추적

### 폴더
- `todo-app/` — 메인 애플리케이션
- `web_version/` — 웹 기반 버전

---

## Study-03: 상식 퀴즈 게임

41개 문제로 구성된 서버 기반 상식 퀴즈 게임

### 개요
- 기술 스택: React (프론트) + Node.js/Hono (백엔드)
- 데이터베이스: SQLite
- 문제: 41개 (역사, 과학, 지리, 일반)

### 주요 기능
| 기능 | 설명 |
|------|------|
| 정답 판정 | 서버에서 계산 (부정행위 방지) |
| 순위표 | 점수/시간/등록순으로 정렬 |
| 카테고리별 점수 | 각 분야별 성과 추적 |
| 세션 저장 | 새로고침 후 복구 가능 |

### 실행
```bash
# 1. 의존성 설치
npm install

# 2. DB 초기화
npm run seed

# 3. 개발 서버 실행 (2개 터미널)
npm run dev:server    # http://localhost:3000
npm run dev:web       # http://localhost:5173
```

### 커스텀 명령어
- `/quiz-add` — 새 문제 자동 생성 및 추가
- `/quiz-validate` — 문제 품질 검증
- `/quiz-range` — 특정 범위 문제 분석

### 점수 계산
- 기본: 정답 시 10점 × 난이도 계수
- 난이도: easy(10) / medium(12) / hard(15)
- 최대 총점: 400점

### 부정행위 방지
정답 미노출 | 서버 점수 계산 | 중복 제출 방지 | Rate Limiting | 닉네임 검증

---

## 빠른 링크

### Study-01
- [상세 README](Study-01/README.md)
- Desktop 버전: `Study-01/desktop_version/CLAUDE.md`
- Web 버전: `Study-01/web_version/CLAUDE.md`

### Study-02
- PRD 문서: `Study-02/할 일 관리 앱 PRD.md`

### Study-03
- [상세 README](Study-03/README.md)
- API 명세 및 스키마 참고
- 테스트: `npm run test:integration`

---

## 개발 팁

### 전역 명령어 (각 프로젝트마다 다를 수 있음)
```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 실행
npm run build    # 빌드
npm run test     # 테스트
```

### 각 프로젝트의 상세한 내용은 개별 README를 참고하세요.

---

**Last Updated**: 2026-11-08
