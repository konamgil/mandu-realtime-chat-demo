import { beforeEach, describe, expect, it, spyOn } from "bun:test";
import { addMessage, getChatStore, subscribe } from "../src/server/chat/store";

describe("chat publish integrity", () => {
  beforeEach(() => {
    globalThis.__manduChatStore__ = undefined;
  });

  it("does not crash when a stale listener throws during publish", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(() => undefined);

    subscribe(() => {
      throw new Error("controller closed");
    });

    const stable = { calls: 0 };
    subscribe(() => {
      stable.calls += 1;
    });

    expect(() =>
      addMessage({ role: "user", author: "demo-user", text: "publish integrity" }),
    ).not.toThrow();

    expect(stable.calls).toBe(1);
    expect(getChatStore().listeners.size).toBe(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});
