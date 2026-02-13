import { getChatStore } from "../../../../src/server/chat/store";

export function GET() {
  const store = getChatStore();
  return Response.json({ messages: store.messages });
}
