# Mandu Framework 지원성 체크리스트 (mandu-chat-demo 기준)

작성일: 2026-02-14

## 1) 라우팅/API 핸들러
- [x] 파일 기반 라우트(`app/api/**/route.ts`) 동작
- [x] Request/Response 표준 API 기반 구현 가능
- [ ] 쿼리/바디 스키마 검증 유틸 기본 제공 여부 (부재, 수동 구현)

## 2) Realtime/SSE
- [x] `ReadableStream` 기반 SSE 구성 가능
- [x] 클라이언트 EventSource 연동 가능
- [ ] SSE 헬퍼(heartbeat, 직렬화, disconnect cleanup) 내장 유틸 부재

## 3) 상태/스토어 (데모 인메모리)
- [x] 단일 프로세스 인메모리 데모에는 적합
- [ ] 멀티 인스턴스/영속 스토어 가이던스는 별도 구축 필요

## 4) 개발자 경험(DX)
- [x] bun + mandu cli dev loop 동작
- [x] bun test로 route/store 단위 테스트 가능
- [ ] API 에러 응답 계약(코드/형식) 표준화 템플릿 부족

## 5) Demo-First 검증 결과
- [x] 데모 기능 2건(입력 정책, limit 스냅샷) 먼저 구현/검증
- [x] 구현 중 반복 코드 확인
- [x] 반복 코드 기반 framework gap 도출

## 발견된 framework gap
1. **Typed query/body schema helper 부재**
   - 증상: 각 route에서 `URLSearchParams`, `Number(...)`, 경계값 클램프를 반복
2. **SSE route helper 부재**
   - 증상: `send(event,data)`, ping, abort cleanup를 매 route에서 재작성
3. **표준 API 에러 응답 유틸 부재**
   - 증상: `{ error, code }` 형식 수동 합의
