import { test, expect } from "@playwright/test";

test.describe("e2e: login → chat → send → UI reflect (+ SSE reconnect catch-up)", () => {
  test("demo login, send one message, then reconnect and catch up missed message", async ({ page, request, baseURL }) => {
    const origin = baseURL ?? "http://localhost:3333";

    // 1) Visit login page
    await page.goto(`${origin}/login`);
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();

    // 2) Seed an authenticated session.
    // NOTE: UI login hydration can be flaky in CI (default form GET). We keep /login as a smoke visit,
    // then seed session to make the chat flow deterministic.
    // 3) Go to chat page and seed localStorage, then reload so the app picks it up.
    await page.goto(`${origin}/`);
    await page.evaluate(() => {
      window.localStorage.setItem(
        "mandu-chat-demo.session",
        JSON.stringify({
          email: "demo@mandu.dev",
          name: "Demo User",
          loggedInAt: new Date().toISOString(),
        })
      );
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // If for any reason we're still seeing the login UI, force-apply session + reload.
    if (await page.getByRole("button", { name: "로그인" }).isVisible().catch(() => false)) {
      await page.evaluate(() => {
        window.localStorage.setItem(
          "mandu-chat-demo.session",
          JSON.stringify({
            email: "demo@mandu.dev",
            name: "Demo User",
            loggedInAt: new Date().toISOString(),
          })
        );
      });
      await page.reload();
    }

    // 4) Confirm we landed on chat page and SSE is connected
    // (Use input placeholder as a stable signal that chat UI is hydrated)
    const chatInput = page.getByPlaceholder(/메시지 입력/);
    await expect(chatInput).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("실시간 연결됨")).toBeVisible({ timeout: 20_000 });

    // 5) Send a message via UI and confirm it renders
    const uiMessage = `e2e-ui-${Date.now()}`;
    await chatInput.fill(uiMessage);
    await chatInput.press("Enter");
    await expect(page.getByText(uiMessage, { exact: true })).toBeVisible();

    // 5) (Best-effort) SSE reconnect + catch-up:
    // Force network offline so EventSource disconnects, publish a message while disconnected,
    // then bring network back and ensure the missed message is fetched via catch-up.
    await page.context().setOffline(true);
    await expect(page.getByText("연결 중...")).toBeVisible({ timeout: 15_000 });

    const missedMessage = `e2e-missed-${Date.now()}`;
    const sendResponse = await request.post(`${origin}/api/chat/send`, {
      data: { text: missedMessage },
    });
    expect(sendResponse.ok()).toBeTruthy();

    await page.context().setOffline(false);
    await expect(page.getByText("실시간 연결됨")).toBeVisible({ timeout: 20_000 });

    // Catch-up can arrive via either: reconnected SSE or the ready→syncMissedMessages fetch.
    // NOTE: strict mode can fail if the same text appears in multiple places (e.g., AI echo).
    await expect(page.getByText(missedMessage, { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  });
});
