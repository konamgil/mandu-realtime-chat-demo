import type { ChatMessage } from "./store";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function buildAiReply(input: string): Promise<string> {
  await sleep(350);

  if (input.includes("안녕")) {
    return "안녕하세요! Mandu 데모 AI입니다. 실시간 채팅 연결 정상입니다.";
  }

  if (input.includes("mcp") || input.includes("MCP")) {
    return "MCP 연결 기준으로 에이전트 작업을 분리해 처리할 수 있어요. 지금 데모에서도 그 구조를 반영했습니다.";
  }

  return `AI 응답: "${input}" 요청 확인했습니다. 다음 단계로 서버/에이전트 협업 시나리오를 이어갈 수 있어요.`;
}

export function buildAgentComment(lastUserMessage: ChatMessage): string {
  return `agent-observer: 사용자 메시지(${lastUserMessage.text.length}자) 수신, 후속 작업 대기 중`;
}
