import { beforeEach, describe, expect, it } from "bun:test";
import { POST } from "../app/api/chat/send/route";

describe("POST /api/chat/send validation", () => {
  beforeEach(() => {
    globalThis.__manduChatStore__ = undefined;
  });

  it("returns 400 when text is empty", async () => {
    const req = new Request("http://localhost:3333/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "   " }),
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("EMPTY_TEXT");
  });

  it("returns 422 when text exceeds 500 chars", async () => {
    const req = new Request("http://localhost:3333/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "x".repeat(501) }),
    });

    const response = await POST(req);
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.code).toBe("TEXT_TOO_LONG");
  });
});
