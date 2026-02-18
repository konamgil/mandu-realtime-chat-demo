import filling from "../../../../spec/slots/api-chat-reaction.slot";

async function handler(req: Request) {
  return filling.handle(req, {}, { routeId: "api-chat-reaction", pattern: "/api/chat/reaction" });
}

export const POST = handler;
export const GET = handler;
export const DELETE = handler;
