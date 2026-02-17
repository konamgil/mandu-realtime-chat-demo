import { mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3333";
const VIDEO_DIR = join(process.cwd(), "artifacts", "videos");
const TMP_VIDEO_DIR = join(VIDEO_DIR, ".tmp");
const now = new Date();
const DATE = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

mkdirSync(VIDEO_DIR, { recursive: true });
mkdirSync(TMP_VIDEO_DIR, { recursive: true });

async function disableKitchenOverlay(page: import("playwright").Page) {
  await page
    .evaluate(() => {
      const host = document.querySelector("#mandu-kitchen-host") as HTMLElement | null;
      if (host) host.style.pointerEvents = "none";
    })
    .catch(() => undefined);
}

async function ensureLogin(page: import("playwright").Page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await disableKitchenOverlay(page);
  await page.evaluate(() => {
    window.localStorage.setItem(
      "mandu-chat-demo.session",
      JSON.stringify({
        email: "demo@mandu.dev",
        name: "Demo User",
        loggedInAt: new Date().toISOString(),
      }),
    );
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await disableKitchenOverlay(page);
  await page.getByPlaceholder(/메시지 입력/).waitFor({ state: "visible", timeout: 20_000 });
}

const scenarios: Record<string, (page: import("playwright").Page) => Promise<void>> = {
  "01-login-send": async (page) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await disableKitchenOverlay(page);
    await page.getByRole("button", { name: "로그인" }).click({ force: true });
    const input = page.getByPlaceholder(/메시지 입력/);
    await input.waitFor({ state: "visible", timeout: 20_000 });
    await input.fill(`시나리오1 메시지 ${Date.now()}`);
    await input.press("Enter");
    await page.waitForTimeout(1200);
  },
  "02-offline-reconnect": async (page) => {
    await ensureLogin(page);
    const input = page.getByPlaceholder(/메시지 입력/);
    await input.fill(`재연결 전 메시지 ${Date.now()}`);
    await input.press("Enter");
    await page.waitForTimeout(700);
    await page.context().setOffline(true);
    await page.waitForTimeout(1300);
    await page.context().setOffline(false);
    await page.waitForTimeout(1500);
  },
  "03-longtext-guard": async (page) => {
    await ensureLogin(page);
    const input = page.getByPlaceholder(/메시지 입력/);
    await input.fill("x".repeat(520));
    await page.waitForTimeout(900);
    await input.fill(`정상 길이 메시지 ${Date.now()}`);
    await input.press("Enter");
    await page.waitForTimeout(1100);
  },
};

async function main() {
  const scenarioName = process.argv[2];
  if (!scenarioName || !scenarios[scenarioName]) {
    console.error(`Usage: bun run scripts/record-chat-scenario.ts <${Object.keys(scenarios).join("|")}>`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: TMP_VIDEO_DIR, size: { width: 1280, height: 720 } },
  });

  const page = await context.newPage();
  await scenarios[scenarioName](page);

  const video = page.video();
  await context.close();
  await browser.close();

  const src = await video?.path();
  if (!src) throw new Error(`No video output for scenario: ${scenarioName}`);

  const dst = join(VIDEO_DIR, `chat-demo-${DATE}-${scenarioName}.webm`);
  copyFileSync(src, dst);
  console.log(`✅ ${scenarioName}: ${dst}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
