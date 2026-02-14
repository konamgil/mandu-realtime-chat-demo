# record:demo Test Scenarios (Issue #3)

작성일: 2026-02-14

`bun run record:demo` 경로의 재현/회귀 검증을 위한 시나리오 문서.

## 목표
- 무한 대기처럼 보이는 실패를 **명시적 종료 + 리포트 기록**으로 표준화
- 실패 지점을 단계별(`steps`)로 분류 가능하게 유지
- 수정 후 회귀 검증 체크리스트를 고정

## Scenario R1 — Health check 단계 검증

### 재현 단계
```bash
DEMO_BASE_URL=http://127.0.0.1:3333 bun run record:demo
```

### 기대 결과
- localhost/127 후보 fallback으로 health 단계 통과 또는 timeout 시 명확 실패
- 실패 시 report에 timeout 원인 URL 목록 기록

### 실패 증상
- `Health check timeout: .../api/health`
- report `steps`가 `dev-started` 부근에서 멈춤

## Scenario R2 — 페이지 진입/입력창 대기 검증

### 재현 단계
```bash
bun run record:demo
```

### 기대 결과
- `page.goto(..., domcontentloaded)` 이후 입력창 selector를 찾고 시나리오 진행

### 실패 증상
- `waiting for locator('input[placeholder*="메시지"]')` timeout
- report에 실패 시점과 오류 원인 기록

## Scenario R3 — Runtime 오류 분리 검증

### 재현 단계
```bash
bun run record:demo
```

### 기대 결과
- dev 로그에 `Invalid hook call`/`FRAMEWORK_BUG` 없음
- `artifacts/videos/*.webm`와 `artifacts/reports/*-ok.json` 생성

### 실패 증상
- dev 로그: `Invalid hook call`, `[Mandu] FRAMEWORK_BUG`
- 영상 미생성 + 실패 report 생성

## Issue #83 Demo-first Framework Requirement

### 핵심 요구사항 (demo-first)
- `record:demo`는 **도구 실행 방식(bunx/mandu)** 과 무관하게 동일한 React 인스턴스 경계에서 SSR + Hook 실행이 보장되어야 한다.
- 페이지 진입 시 `Invalid hook call`이 발생하면 데모 녹화 파이프라인 자체가 멈추므로, 프레임워크는 런타임/앱 React 경계를 일관되게 유지해야 한다.
- 실패하더라도 리포트/로그 아티팩트는 남겨야 하며, 성공 시 입력창 상호작용까지 진행되어야 한다.

### #83 검증 로그 포인트
- 실패 기준: `[Mandu] FRAMEWORK_BUG: ... resolveDispatcher().useState`
- 성공 기준: 입력창 탐색/입력/전송 완료 + 영상/리포트 생성

## Issue #81 Demo-first Framework Requirement

### 사용자 시나리오 기반 요구사항
- 채팅 화면에서 메시지 조회/전송 API는 route마다 반복되는 query/body/error 처리 보일러플레이트를 만들지 않아야 한다.
- 프레임워크는 `querySchema`/`bodySchema`/`apiError` 수준의 최소 helper로 재사용 가능한 경계를 제공해야 한다.

### 검증 로그 (2026-02-14)
- `bun run record:demo` → `record-realtime-chat-1771053848151.json` (`status: ok`)
- steps: `dev-started → health-ok → page-loaded → scenario-done`
- video: `artifacts/videos/15470260a4f6cc902cd58c12fe840e99.webm`

## 회귀 테스트 체크리스트
- [ ] `bun run record:demo` 3회 연속 성공
- [x] 실패 시에도 90초 내 종료
- [x] 실패 report에 `steps`, `error`가 항상 기록
- [x] `artifacts/videos`, `artifacts/reports` 산출물 생성 여부가 실행 결과와 일치
- [ ] dev 로그에서 runtime hook 오류 재발 여부 확인
- [ ] 기존 API 테스트(`bun test`) pass 유지
- [x] demo 근거를 framework requirement/PR 본문에 연결
