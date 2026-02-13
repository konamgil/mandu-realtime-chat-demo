import { beforeEach, describe, expect, it } from "bun:test";
import { addMessage, getChatStore, listMessages } from "../src/server/chat/store";

describe("chat catch-up requirements", () => {
  beforeEach(() => {
    globalThis.__manduChatStore__ = undefined;
  });

  it("returns only messages created after sinceId (reconnect catch-up)", () => {
    const initial = getChatStore().messages[0];

    const first = addMessage({ role: "user", author: "demo-user", text: "first" });
    const second = addMessage({ role: "ai", author: "mandu-ai", text: "second" });

    const catchup = listMessages({ sinceId: first.id });

    expect(catchup.map((m) => m.id)).toEqual([second.id]);
    expect(catchup[0]?.text).toBe("second");
    expect(initial.id).not.toBe(second.id);
  });

  it("falls back to full snapshot when sinceId is unknown", () => {
    addMessage({ role: "user", author: "demo-user", text: "hello" });

    const result = listMessages({ sinceId: "unknown" });

    expect(result.length).toBeGreaterThan(1);
  });
});
