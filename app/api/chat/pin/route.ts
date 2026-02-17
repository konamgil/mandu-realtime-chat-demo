// 핀 데이터: roomId → messageId[]
const pinnedMessages = new Map<string, string[]>();
const MAX_PINS = 3;

async function handler(req: Request) {
  const method = req.method;
  const url = new URL(req.url);

  // GET: query string에서 파싱, 나머지: body에서 파싱
  let roomId: string | undefined;
  let messageId: string | undefined;
  if (method === "GET") {
    roomId = url.searchParams.get("roomId") ?? undefined;
    messageId = url.searchParams.get("messageId") ?? undefined;
  } else {
    const body = await req.json().catch(() => ({}));
    roomId = body.roomId;
    messageId = body.messageId;
  }

  if (!roomId) {
    return Response.json({ error: "roomId required" }, { status: 400 });
  }

  const pins = pinnedMessages.get(roomId) ?? [];

  if (method === "POST") {
    if (pins.includes(messageId)) {
      return Response.json({ success: true, pinnedIds: pins });
    }
    if (pins.length >= MAX_PINS) {
      return Response.json({ error: `최대 ${MAX_PINS}개까지 고정 가능합니다` }, { status: 400 });
    }
    const updated = [...pins, messageId];
    pinnedMessages.set(roomId, updated);
    return Response.json({ success: true, pinnedIds: updated });
  }

  if (method === "DELETE") {
    const updated = pins.filter((id) => id !== messageId);
    pinnedMessages.set(roomId, updated);
    return Response.json({ success: true, pinnedIds: updated });
  }

  // GET: 핀 목록 조회
  return Response.json({ success: true, pinnedIds: pins });
}

export const POST = handler;
export const DELETE = handler;
export const GET = handler;
