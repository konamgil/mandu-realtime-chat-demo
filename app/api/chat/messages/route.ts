import { listMessages } from "../../../../src/server/chat/store";

export function GET(request: Request) {
  const url = new URL(request.url);
  const sinceId = url.searchParams.get("sinceId") ?? undefined;
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;

  return Response.json({ messages: listMessages({ sinceId, limit }) });
}
