import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:3333";
const VIDEO_DIR = join(process.cwd(), "artifacts", "videos");
const REPORT_DIR = join(process.cwd(), "artifacts", "reports");

mkdirSync(VIDEO_DIR, { recursive: true });
mkdirSync(REPORT_DIR, { recursive: true });

async function waitForHealth(url: string, timeoutMs = 30000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Health check timeout: ${url}/api/health`);
}

async function main() {
  const startedAt = new Date().toISOString();
  const dev = spawn("bun", ["run", "dev"], {
    stdio: "ignore",
    detached: true,
  });

  try {
    await waitForHealth(BASE_URL);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.fill('input[placeholder*="메시지"]', "자동화 영상 테스트 메시지");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2500);

    // 추가 시나리오: 길이 제한 확인
    await page.fill('input[placeholder*="메시지"]', "x".repeat(501));
    await page.waitForTimeout(700);

    await context.close();
    await browser.close();

    const endedAt = new Date().toISOString();
    const reportPath = join(REPORT_DIR, `record-realtime-chat-${Date.now()}.json`);
    writeFileSync(
      reportPath,
      JSON.stringify(
        {
          scenario: "realtime-chat-smoke",
          baseUrl: BASE_URL,
          startedAt,
          endedAt,
          videoDir: VIDEO_DIR,
          status: "ok",
        },
        null,
        2,
      ),
    );

    console.log(`✅ video recorded: ${VIDEO_DIR}`);
    console.log(`✅ report: ${reportPath}`);
  } finally {
    try {
      process.kill(-dev.pid, "SIGTERM");
    } catch {}
  }
}

main().catch((err) => {
  console.error("❌ record scenario failed", err);
  process.exit(1);
});
