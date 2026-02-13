# mandu-realtime-chat-demo

Mandu Framework 기반 **실시간 채팅 데모**입니다.  
AI 응답, 서버 통신, 에이전트 참여 구조를 1차 동작 형태로 구현했습니다.

---

## 핵심 기능

- 실시간 메시지 스트림 (SSE)
- 사용자 메시지 전송 API (입력 검증 + 에러 코드)
- AI 응답 생성(데모 로직)
- 에이전트 옵저버 메시지 참여
- 초기 스냅샷 `limit` 지원 (경량 로드)
- 입력창 남은 글자수/길이 초과 방지 + `Ctrl/Cmd + Enter` 전송
- MCP 설정 포함 (`.mcp.json`)

---

## 기술 스택

- **Framework**: Mandu
- **Runtime**: Bun
- **Language**: TypeScript
- **UI**: React
- **Realtime**: Server-Sent Events (SSE)

---

## 프로젝트 구조

```txt
app/
  api/
    chat/
      messages/route.ts   # 채팅 메시지 조회
      send/route.ts       # 메시지 전송 + AI/Agent 응답 생성
      stream/route.ts     # SSE 실시간 스트림
    health/route.ts       # 헬스체크
  layout.tsx
  page.tsx                # 데모 채팅 UI

src/server/chat/
  store.ts                # 인메모리 메시지 스토어
  ai.ts                   # AI/에이전트 응답 로직
```

---

## 실행 방법

```bash
bun install
bun run dev
```

실행 후 접속:
- `http://localhost:3333`

### Windows/환경별 안정 실행 (권장)

`Lockfile 불일치` 경고나 dev 프로세스 종료 이슈가 보이면 아래 순서로 실행하세요.

```bash
bun run lock
bun run dev:safe
```

또는 수동으로:

```bash
bunx mandu lock
bunx mandu dev --watch
```

---

## API 요약

### 1) 헬스체크
- `GET /api/health`

### 2) 메시지 조회
- `GET /api/chat/messages`

### 3) 메시지 전송
- `POST /api/chat/send`
- body:

```json
{ "text": "안녕" }
```

### 4) 실시간 스트림
- `GET /api/chat/stream`
- 이벤트 타입:
  - `ready`
  - `message`
  - `ping`

---

## MCP

프로젝트에 MCP 설정이 포함되어 있습니다.

```json
{
  "mcpServers": {
    "mandu": {
      "command": "bunx",
      "args": ["@mandujs/mcp"],
      "cwd": "."
    }
  }
}
```

---

## 현재 상태

- 1차 동작 버전 완료
- 다음 단계:
  - 실제 LLM API 연동
  - 다중 에이전트 라우팅
  - 인증/세션 관리
  - 프레임워크 이슈 분리 브랜치 + PR 반영

---

## License

MPL-2.0 (Mandu 생태계와 동일 정책 준수)
