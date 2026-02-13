import { addMessage } from "../../../../src/server/chat/store";
import { buildAgentComment, buildAiReply } from "../../../../src/server/chat/ai";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!text) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const user = addMessage({
    role: "user",
    author: "demo-user",
    text,
  });

  const aiText = await buildAiReply(text);
  const ai = addMessage({
    role: "ai",
    author: "mandu-ai",
    text: aiText,
  });

  const agent = addMessage({
    role: "agent",
    author: "agent-observer",
    text: buildAgentComment(user),
  });

  return Response.json({ ok: true, user, ai, agent });
}
