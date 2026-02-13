import { listMessages } from "../../../../src/server/chat/store";

export function GET(request: Request) {
  const url = new URL(request.url);
  const sinceId = url.searchParams.get("sinceId") ?? undefined;
  return Response.json({ messages: listMessages({ sinceId }) });
}
