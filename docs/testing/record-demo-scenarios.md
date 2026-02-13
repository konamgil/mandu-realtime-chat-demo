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

## 회귀 테스트 체크리스트
- [ ] `bun run record:demo` 3회 연속 성공
- [ ] 실패 시에도 90초 내 종료
- [ ] 실패 report에 `steps`, `error`가 항상 기록
- [ ] `artifacts/videos`, `artifacts/reports` 산출물 생성 여부가 실행 결과와 일치
- [ ] dev 로그에서 runtime hook 오류 재발 여부 확인
- [ ] 기존 API 테스트(`bun test`) pass 유지
