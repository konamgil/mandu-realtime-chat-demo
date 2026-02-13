import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:3333";
const VIDEO_DIR = join(process.cwd(), "artifacts", "videos");
const REPORT_DIR = join(process.cwd(), "artifacts", "reports");
const MAX_RUN_MS = 90_000;

mkdirSync(VIDEO_DIR, { recursive: true });
mkdirSync(REPORT_DIR, { recursive: true });

function now() {
  return new Date().toISOString();
}

async function waitForHealth(url: string, timeoutMs = 30_000) {
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

async function stopDev(dev: ReturnType<typeof spawn>) {
  if (dev.exitCode !== null) return;

  dev.kill("SIGTERM");
  const exited = await new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(false), 5000);
    dev.once("exit", () => {
      clearTimeout(timer);
      resolve(true);
    });
  });

  if (!exited && dev.exitCode === null) {
    dev.kill("SIGKILL");
  }
}

async function main() {
  const startedAt = now();
  const steps: string[] = [];
  let browserOpened = false;

  const dev = spawn("bun", ["run", "dev"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  dev.stdout?.on("data", (buf) => {
    const line = String(buf).trim();
    if (line) console.log(`[dev] ${line}`);
  });
  dev.stderr?.on("data", (buf) => {
    const line = String(buf).trim();
    if (line) console.error(`[dev:err] ${line}`);
  });

  const run = (async () => {
    steps.push("dev-started");
    await waitForHealth(BASE_URL);
    steps.push("health-ok");

    const browser = await chromium.launch({ headless: true });
    browserOpened = true;
    const context = await browser.newContext({
      recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    steps.push("page-loaded");

    await page.fill('input[placeholder*="메시지"]', "자동화 영상 테스트 메시지");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2500);

    await page.fill('input[placeholder*="메시지"]', "x".repeat(501));
    await page.waitForTimeout(700);
    steps.push("scenario-done");

    await context.close();
    await browser.close();
    browserOpened = false;

    const endedAt = now();
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
          steps,
        },
        null,
        2,
      ),
    );

    console.log(`✅ video recorded: ${VIDEO_DIR}`);
    console.log(`✅ report: ${reportPath}`);
  })();

  try {
    await Promise.race([
      run,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`record timeout after ${MAX_RUN_MS}ms`)), MAX_RUN_MS),
      ),
    ]);
  } catch (err) {
    const endedAt = now();
    const reportPath = join(REPORT_DIR, `record-realtime-chat-${Date.now()}-failed.json`);
    writeFileSync(
      reportPath,
      JSON.stringify(
        {
          scenario: "realtime-chat-smoke",
          baseUrl: BASE_URL,
          startedAt,
          endedAt,
          status: "failed",
          browserOpened,
          steps,
          error: err instanceof Error ? err.message : String(err),
        },
        null,
        2,
      ),
    );
    console.error(`❌ record scenario failed: ${err instanceof Error ? err.message : String(err)}`);
    console.error(`❌ report: ${reportPath}`);
    process.exitCode = 1;
  } finally {
    await stopDev(dev);
  }
}

main();
