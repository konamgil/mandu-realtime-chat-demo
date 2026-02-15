import { test, expect } from "@playwright/test";


test.describe("route:/login", () => {
  test("smoke /login", async ({ page, baseURL }) => {
    const url = (baseURL ?? "http://localhost:3333") + "/login";
    // L0: no console.error / uncaught exception / 5xx
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(String(err)));
    await page.goto(url);

    expect(errors, "console/page errors").toEqual([]);
  });
});
