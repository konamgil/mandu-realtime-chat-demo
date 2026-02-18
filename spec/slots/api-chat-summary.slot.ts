import { listMessages } from "../../src/server/chat/store";

// 요약 캐시: roomId → { summary, messageCount, generatedAt, expiresAt }
const summaryCache = new Map<string, {
  summary: string;
  messageCount: number;
  generatedAt: string;
  expiresAt: number;
}>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId") ?? "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);

  if (!roomId) {
    return Response.json({ error: "roomId is required" }, { status: 400 });
  }

  // 캐시 확인
  const cached = summaryCache.get(roomId);
  if (cached && cached.expiresAt > Date.now()) {
    return Response.json({
      summary: cached.summary,
      messageCount: cached.messageCount,
      generatedAt: cached.generatedAt,
      cachedUntil: new Date(cached.expiresAt).toISOString(),
    });
  }

  // 메시지 가져오기 (store에서 직접)
  const messages = listMessages({ limit });

  if (messages.length === 0) {
    const generatedAt = new Date().toISOString();
    const expiresAt = Date.now() + CACHE_TTL_MS;
    const result = {
      summary: "아직 대화 내용이 없습니다.",
      messageCount: 0,
      generatedAt,
      expiresAt,
    };
    summaryCache.set(roomId, result);
    return Response.json({
      summary: result.summary,
      messageCount: result.messageCount,
      generatedAt: result.generatedAt,
      cachedUntil: new Date(expiresAt).toISOString(),
    });
  }

  // Anthropic API로 요약 생성
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // API 키 없을 때 fallback 요약
    const recent = messages.slice(-3).map((m) => m.text.slice(0, 30)).join(", ");
    const summary = `최근 ${messages.length}개의 메시지가 있습니다. 주요 내용: ${recent}`;
    const generatedAt = new Date().toISOString();
    const expiresAt = Date.now() + CACHE_TTL_MS;
    summaryCache.set(roomId, { summary, messageCount: messages.length, generatedAt, expiresAt });
    return Response.json({
      summary,
      messageCount: messages.length,
      generatedAt,
      cachedUntil: new Date(expiresAt).toISOString(),
    });
  }

  const conversationText = messages
    .slice(-limit)
    .map((m) => `${m.author}: ${m.text}`)
    .join("\n");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `다음 채팅 대화를 한국어로 3-5문장으로 간결하게 요약해주세요:\n\n${conversationText}`,
        }],
      }),
    });

    const aiResult = await response.json();
    const summary: string = aiResult.content?.[0]?.text ?? "요약을 생성할 수 없습니다.";
    const generatedAt = new Date().toISOString();
    const expiresAt = Date.now() + CACHE_TTL_MS;

    summaryCache.set(roomId, { summary, messageCount: messages.length, generatedAt, expiresAt });

    return Response.json({
      summary,
      messageCount: messages.length,
      generatedAt,
      cachedUntil: new Date(expiresAt).toISOString(),
    });
  } catch {
    return Response.json({ error: "요약 생성 실패" }, { status: 500 });
  }
}
