# Test Scenarios (Living Document)

작성일: 2026-02-14

이 문서는 데모 시나리오를 보관하고, 실행 결과를 누적 기록한다.

## Scenario A — 재연결 Catch-up + 초기 스냅샷 Limit

### 목적
- 재연결 시 누락 메시지 구간만 안전하게 복구되는지 확인
- 초기 로드에서 `limit` 기반 경량 스냅샷이 동작하는지 확인

### 실행 명령
```bash
bun test tests/chat-catchup.test.ts
```

### 최신 결과
- pass: 3
- fail: 0
- 확인 항목:
  - `sinceId` 이후 메시지 반환
  - unknown `sinceId` 시 full snapshot fallback
  - `limit` 파라미터 적용

## Scenario B — 메시지 입력 정책 검증

### 목적
- 입력 무결성 정책(빈 텍스트/길이 초과)을 API 계약으로 강제

### 실행 명령
```bash
bun test tests/chat-send-validation.test.ts
```

### 최신 결과
- pass: 2
- fail: 0
- 확인 항목:
  - empty text -> `400 EMPTY_TEXT`
  - >500 chars -> `422 TEXT_TOO_LONG`

## 실행 이력

### 2026-02-14 00:53 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-full.log`
- 결과: 전체 pass (9/9)
- 요구사항 도출:
  - Route 계약(helper) 차원에서 `EMPTY_TEXT(400)` / `TEXT_TOO_LONG(422)` 같은 정책 에러를 반복 없이 선언형으로 정의할 필요
  - SSE 재연결의 `sinceId`/snapshot fallback/limit 정책을 공통 route 계약으로 승격할 근거 확보
- 철학 정합성 점검:
  - 무결성: 입력 정책/에러코드가 테스트로 고정되어야 함
  - 아키텍처 일관성: route.ts 전반 동일한 계약 패턴 필요
  - 재사용 우선: route별 중복 검증/에러 매핑 제거 필요
  - 중복 금지: helper 없이 각 route에 수동 구현 시 drift 위험 큼
- 브라우저 동작 확인/영상화: OpenClaw browser relay 미연결로 자동 캡처/녹화 미수행(환경 이슈)

### 2026-02-14 00:44 KST (issue-cycle)
- Scenario A 실행 로그: `docs/logs/2026-02-14-scenario-a.log`
- Scenario B 실행 로그: `docs/logs/2026-02-14-scenario-b.log`
- 결과: 전체 pass (A: 3/3, B: 2/2)
- 브라우저 동작 확인/영상화: OpenClaw browser relay 미연결로 자동 캡처 실패(환경 이슈)

## 개선 원칙
- 시나리오는 삭제보다 개선(확장) 우선
- 새 기능은 시나리오/검증 로그 없이 merge 금지
- 데모 재현 가능한 증거가 있어야 framework 요구사항으로 승격
