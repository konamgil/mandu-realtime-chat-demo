import { describe, expect, it } from "bun:test";
import {
  AUTH_STORAGE_KEY,
  DEMO_ACCOUNTS,
  authenticate,
  normalizeEmail,
  parseSession,
} from "../app/lib/auth";

describe("auth session", () => {
  it("normalizes email", () => {
    expect(normalizeEmail(" Demo@Mandu.Dev ")).toBe("demo@mandu.dev");
  });

  it("authenticates with demo account", () => {
    const account = DEMO_ACCOUNTS[0];
    const session = authenticate("DEMO@mandu.dev", account.password);

    expect(session).not.toBeNull();
    expect(session?.email).toBe(account.email);
    expect(session?.name).toBe(account.name);
    expect(session?.loggedInAt).toBeString();
  });

  it("rejects invalid credentials", () => {
    expect(authenticate("demo@mandu.dev", "wrong-password")).toBeNull();
    expect(authenticate("none@mandu.dev", "password")).toBeNull();
  });

  it("parses only valid JSON session", () => {
    const valid = JSON.stringify({
      email: "demo@mandu.dev",
      name: "Demo User",
      loggedInAt: "2026-02-14T00:00:00.000Z",
    });

    expect(parseSession(valid)).toEqual({
      email: "demo@mandu.dev",
      name: "Demo User",
      loggedInAt: "2026-02-14T00:00:00.000Z",
    });

    expect(parseSession("not-json")).toBeNull();
    expect(parseSession(JSON.stringify({ email: "a" }))).toBeNull();
    expect(AUTH_STORAGE_KEY).toBe("mandu-chat-demo.session");
  });
});
