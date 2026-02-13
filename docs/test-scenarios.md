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

## Scenario C — SSE dead listener publish 격리

### 목적
- stale listener 예외가 publish 경로를 중단시키지 않는지 확인
- 실패 listener를 자동 분리해 listener 집합 무결성 유지

### 실행 명령
```bash
bun test tests/chat-publish-integrity.test.ts
```

### 최신 결과
- pass: 1
- fail: 0
- 확인 항목:
  - throw listener 존재 시에도 `addMessage`는 정상 반환
  - 정상 listener는 동일 publish에서 계속 호출됨
  - 실패 listener는 자동 제거되어 후속 크래시 확산 차단

## 실행 이력

### 2026-02-14 02:43 KST (issue #1 대응)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0243.log`
- 결과: 전체 pass (10/10)
- 데모 재현/요구사항 도출:
  - SSE disconnect 반복 환경에서 stale listener 예외가 publish 경로(`/api/chat/send` 경유 addMessage)를 중단시키면 프로세스 무결성이 깨짐
  - 따라서 publish 경로는 listener 예외를 격리하고 dead listener를 분리해야 함
- 철학 정합성 검토:
  - 무결성: dead listener 예외를 프로세스 경계에서 차단해 서비스 연속성 보장
  - 아키텍처 일관성: stream route가 아닌 store publish 레이어에서 공통 방어 적용
  - 재사용 우선: 개별 route patch가 아니라 `addMessage` 단일 경로 강화
  - 중복 금지: 각 listener 호출부에 중복 try/catch 확산 없이 중앙 집중 처리
- 브라우저 동작/녹화 실행 로그: `docs/logs/2026-02-14-record-demo-0243.log`
- 녹화 리포트: `artifacts/reports/record-realtime-chat-1771004772079-failed.json`
- 결과: 입력 selector 대기 timeout으로 영상 생성 실패(실패 근거 JSON/로그 확보)

### 2026-02-14 02:36 KST (issue #3 대응)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0236.log`
- 결과: 전체 pass (9/9)
- 데모 재현/요구사항 도출:
  - `bun run record:demo` 실행 시 기존에는 health 단계에서 무한 대기성 실패(`127.0.0.1` 접근)로 종료 근거가 약했음
  - recorder 기본 URL을 `localhost`로 전환하고 health check를 `localhost/127.0.0.1` 후보로 검증하도록 개선
  - 페이지 진입 대기를 `networkidle`에서 입력창 selector 기반으로 바꿔 SSE 환경에서 무의미한 대기 가능성을 제거
  - 결과적으로 실패 시점이 `forSelector timeout` + 리포트 JSON으로 명확히 분리되어 재현/원인 추적 가능
- 철학 정합성 검토:
  - 무결성: 실패를 실패로 종료/기록해 데모 증거 체계를 보존
  - 아키텍처 일관성: 브라우저 데모 파이프라인도 동일한 종료 시맨틱/로깅 규약 유지
  - 재사용 우선: 환경(hostname) 차이를 recorder 내부에서 흡수해 반복 수동 진단 제거
  - 중복 금지: 각 실행자별 임시 명령 우회 대신 공통 스크립트 단일 개선
- 브라우저 동작/녹화 실행 로그: `docs/logs/2026-02-14-record-demo-0236.log`
- 녹화 리포트: `artifacts/reports/record-realtime-chat-1771004186494-failed.json`
- 결과: React runtime 오류(`Invalid hook call` / `FRAMEWORK_BUG`)로 영상 생성은 여전히 실패. 단, 무한 대기 없이 실패 근거가 즉시 보존됨


### 2026-02-14 02:13 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0213.log`
- 결과: 전체 pass (5/5)
- 데모 재현/요구사항 도출:
  - Scenario A/B 계약(재연결 catch-up + 입력 무결성) 재현 성공
  - `bun run record:demo` 실행 중 `Invalid hook call` / `[Mandu] FRAMEWORK_BUG` 재현 (로그: `docs/logs/2026-02-14-record-demo-0213.log`)
  - 도출 요구사항: route/page 레벨 임시 우회가 아니라 **framework의 React runtime 단일성 보장(react dispatcher 경계 무결성)**
- 철학 정합성 검토:
  - 무결성/아키텍처 일관성: hook dispatcher 오류 미해결 상태에서 기능성 변경 보류
  - 재사용 우선/중복 금지: 앱별 hotfix 확산 금지, framework 레이어 단일 수정 우선
  - 결론: 데모 필요성과 철학 정합성 없는 변경은 보류(수정 지향 금지 유지)
- 브라우저 동작/녹화 결과: hook/runtime 오류로 신규 영상 미생성

### 2026-02-14 02:03 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0203.log`
- 결과: 전체 pass (9/9)
- 데모 재현/요구사항 도출:
  - Scenario A/B 계약(재연결 catch-up + 입력 무결성) 재현 성공
  - `bun run record:demo` 실행 중 dev 로그에서 `Invalid hook call` / `[Mandu] FRAMEWORK_BUG` 재현
  - 요구사항 우선순위는 신규 기능이 아니라 **React dispatcher/runtime 무결성 복구**
- 철학 정합성 검토:
  - 무결성/아키텍처 일관성: runtime hook 오류 미해결 상태의 기능 확장 금지
  - 재사용 우선/중복 금지: route-level 우회 패치 대신 framework 레이어 단일 해결 우선
  - 결론: 데모 필요성과 철학 정합성 없는 변경 보류(수정 지향 금지 유지)
- 브라우저 동작/녹화 로그: `docs/logs/2026-02-14-record-demo-0203.log`
- 결과: hook/runtime 오류 재현으로 신규 영상 미생성

### 2026-02-14 01:50 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0149.log`
- 결과: 전체 pass (9/9)
- 데모 재현/요구사항 도출:
  - Scenario A/B 계약(재연결 catch-up + 입력 무결성)은 동일하게 재현됨
  - `bun run record:demo` 재실행에서도 dev 로그 기준 `Invalid hook call` / `[Mandu] FRAMEWORK_BUG`가 재발해 브라우저 경로가 차단됨
  - 따라서 우선 보완점은 신규 기능이 아니라 **React dispatcher/runtime 무결성 복구**
- 철학 정합성 검토:
  - 무결성/아키텍처: 훅 디스패처 오류를 남긴 채 기능 확장하면 철학 위반
  - 재사용/중복 금지: route-level 임시 패치 다발보다 framework 레이어 단일 해결이 정합
  - 결론: 데모 근거 없는 확장 변경 보류, runtime root-cause 추적 우선
- 브라우저 동작/녹화 실행 로그: `docs/logs/2026-02-14-record-demo-0149.log`
- 결과: hook/runtime 오류 재현, 신규 영상 미생성

### 2026-02-14 01:43 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0143.log`
- 결과: 전체 pass (9/9)
- 데모 재현/요구사항 도출:
  - Scenario A/B 계약(재연결 catch-up + 입력 무결성)은 여전히 안정적으로 재현됨
  - 브라우저 데모 smoke는 입력 박스 locator 단계에서 실패했고, dev 로그에 `Invalid hook call` / `[Mandu] FRAMEWORK_BUG`가 동일 재현됨
  - 선행 요구사항은 기능 확장이 아니라 **React dispatcher/runtime 무결성 복구**
- 철학 정합성 검토:
  - 무결성/아키텍처 일관성: 런타임 훅 오류가 존재하는 상태에서 신규 기능 이슈/PR 착수 금지
  - 재사용 우선/중복 금지: route별 우회 수정 대신 framework 레이어 원인 해결 우선
  - 결론: 데모 근거 없는 변경 보류(수정 지향 금지 유지)
- 브라우저 동작/녹화 실행 로그: `docs/logs/2026-02-14-record-demo-0143.log`
- 녹화 리포트: `artifacts/reports/record-realtime-chat-1771000549603-failed.json`
- 결과: 시나리오 실패로 신규 영상 미생성(기존 영상만 존재: `artifacts/videos/demo-2026-02-13T16-29-45-253Z.webm`)

### 2026-02-14 01:33 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0133.log`
- 결과: 전체 pass (9/9)
- 데모 재현/요구사항 도출:
  - Scenario A/B 핵심 계약(재연결 catch-up, 입력 무결성)은 여전히 재현 가능하고 안정적
  - 반면 브라우저 데모 경로는 런타임 `Invalid hook call`로 차단되어, 현재 우선 요구사항은 기능 추가가 아니라 **framework runtime 무결성 복구**
- 철학 정합성 검토:
  - 무결성/아키텍처 일관성: 훅 디스패처 오류가 남아있는 상태에서 신규 확장 이슈 착수는 정합성 위반
  - 재사용 우선/중복 금지: route-level 임시 우회보다 framework 레이어 원인 해결이 우선
  - 결론: 데모 근거 없는 변경은 보류, 재현 가능한 런타임 안정성 이슈만 추적
- 브라우저 동작/녹화 실행 로그: `docs/logs/2026-02-14-record-demo-0133.log`
- 결과: `Invalid hook call` / `[Mandu] FRAMEWORK_BUG` 재발로 녹화 영상(`artifacts/videos/*.webm`) 미생성


### 2026-02-14 01:23 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0123.log`
- 결과: 전체 pass (9/9)
- 브라우저 동작/녹화 재현 로그: `docs/logs/2026-02-14-record-demo-0123.log`
- 결과: `Invalid hook call` / `[Mandu] FRAMEWORK_BUG`로 녹화 시나리오 중단, `artifacts/videos/*.webm` 미생성
- 데모 기반 요구사항 도출:
  - route contract helper 논의 전에 런타임 훅 디스패처 무결성(React 단일성/renderer 일관성) 보장이 선결 조건
  - 철학 정합성상(무결성·아키텍처 일관성) 데모 근거 없는 신규 확장 변경은 보류, 재현 가능한 안정성 이슈를 우선 추적

### 2026-02-14 01:16 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-0113.log`
- 결과: 전체 pass (9/9)
- 데모 우선 점검:
  - Scenario A/B(재연결 catch-up + 입력 정책)를 재현해 기존 framework 승격 요구사항(생명주기 cleanup/입력 계약 helper화)이 여전히 유효함을 확인
  - 신규 데모 근거 없이 코드 수정은 보류(수정 지향 금지)
- 브라우저 동작/녹화:
  - 실행 로그: `docs/logs/2026-02-14-record-demo-0116.log`
  - `bun run record:demo` 재현 중 dev 서버에서 `Invalid hook call`/`FRAMEWORK_BUG` 발생 후 녹화 시나리오 진행 불가
  - 영상 산출물(`artifacts/videos`) 생성 실패 → 녹화 스크립트 안정화 + framework hook 오류 분리 대응 필요 (이슈 #3)

### 2026-02-14 01:03 KST (issue-cycle)
- Full regression 실행 로그: `docs/logs/2026-02-14-scenario-cycle-test.log`
- 결과: 전체 pass (9/9)
- 요구사항 검토:
  - 입력 정책 에러코드(400/422)와 SSE catch-up 정책은 계속 framework helper 승격 근거로 유효
  - 데모/테스트 근거 없는 신규 변경은 보류(수정 지향 금지 원칙 유지)
- 브라우저 동작 확인/영상화: paired node 없음 + relay 미연결로 자동 화면 녹화 미수행(환경 제약)


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

## 브라우저 녹화 자동화

### 1회 준비
```bash
bun install
bun run record:setup
```

### 실행
```bash
# 권장: 서버를 먼저 띄운 뒤 녹화
bun run dev:safe
# 다른 터미널
bun run record:demo

# (옵션) 자동 기동 모드
DEMO_AUTOSTART=1 bun run record:demo
```

### 산출물
- 영상: `artifacts/videos/*.webm`
- 리포트: `artifacts/reports/record-realtime-chat-*.json`

## 개선 원칙
- 시나리오는 삭제보다 개선(확장) 우선
- 새 기능은 시나리오/검증 로그 없이 merge 금지
- 데모 재현 가능한 증거가 있어야 framework 요구사항으로 승격
- 개발 완료 후 테스트 시나리오 실행 + 브라우저 영상 첨부 보고를 기본 절차로 고정
