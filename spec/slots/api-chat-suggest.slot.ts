import { listMessages } from "../../src/server/chat/store";

// 규칙 기반 fallback 제안 (API 키 없을 때)
function getRuleBasedSuggestions(lastMessage: string) {
  const text = lastMessage.toLowerCase();

  if (text.includes("안녕") || text.includes("hello") || text.includes("hi")) {
    return [
      { text: "안녕하세요! 반갑습니다 😊", tone: "friendly" as const },
      { text: "안녕하세요.", tone: "formal" as const },
      { text: "네, 안녕하세요!", tone: "brief" as const },
    ];
  }
  if (text.includes("?") || text.includes("무엇") || text.includes("어떻")) {
    return [
      { text: "좋은 질문이에요! 조금 더 자세히 말씀해 주실 수 있나요?", tone: "friendly" as const },
      { text: "말씀하신 내용을 검토해 보겠습니다.", tone: "formal" as const },
      { text: "네, 확인해 볼게요.", tone: "brief" as const },
    ];
  }
  if (text.includes("감사") || text.includes("고맙") || text.includes("thanks")) {
    return [
      { text: "천만에요! 도움이 됐다니 기쁘네요 😄", tone: "friendly" as const },
      { text: "도움이 되었다니 다행입니다.", tone: "formal" as const },
      { text: "별말씀을요!", tone: "brief" as const },
    ];
  }
  if (text.includes("오류") || text.includes("에러") || text.includes("error") || text.includes("문제")) {
    return [
      { text: "어떤 오류가 발생했는지 자세히 알려주시면 같이 해결해 볼게요!", tone: "friendly" as const },
      { text: "오류 메시지와 발생 상황을 공유해 주시겠습니까?", tone: "formal" as const },
      { text: "오류 내용 공유해주세요.", tone: "brief" as const },
    ];
  }
  // 기본 제안
  return [
    { text: "알겠습니다! 더 필요한 것이 있으면 말씀해 주세요 😊", tone: "friendly" as const },
    { text: "네, 이해했습니다.", tone: "formal" as const },
    { text: "👍", tone: "brief" as const },
  ];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId") ?? "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "10"), 20);

  if (!roomId) {
    return Response.json({ error: "roomId is required" }, { status: 400 });
  }

  const messages = listMessages({ limit });

  if (messages.length === 0) {
    return Response.json({
      suggestions: [
        { text: "안녕하세요! 무엇을 도와드릴까요? 😊", tone: "friendly" },
        { text: "안녕하세요.", tone: "formal" },
        { text: "반갑습니다!", tone: "brief" },
      ],
      basedOn: "(메시지 없음)",
    });
  }

  const lastMsg = messages[messages.length - 1];
  const basedOn = `${lastMsg.author}: ${lastMsg.text.slice(0, 50)}${lastMsg.text.length > 50 ? "…" : ""}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({
      suggestions: getRuleBasedSuggestions(lastMsg.text),
      basedOn,
    });
  }

  const context = messages
    .slice(-5)
    .map((m) => `${m.author}: ${m.text}`)
    .join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `다음 채팅 대화에 이어서 보낼 수 있는 한국어 답장 3가지를 제안해주세요.
각각 친근한(friendly), 격식체(formal), 짧게(brief) 톤으로 작성해주세요.
JSON 배열로만 응답: [{"text":"...","tone":"friendly"},{"text":"...","tone":"formal"},{"text":"...","tone":"brief"}]

대화:
${context}`,
        }],
      }),
    });

    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : getRuleBasedSuggestions(lastMsg.text);

    return Response.json({ suggestions, basedOn });
  } catch {
    return Response.json({ suggestions: getRuleBasedSuggestions(lastMsg.text), basedOn });
  }
}
