import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function waitForHealth(url: string, timeoutMs: number) {
  const started = Date.now();
  let lastErr: unknown = null;

  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
      lastErr = new Error(`Health not ok: ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(250);
  }

  throw new Error(
    `Health check timeout after ${timeoutMs}ms: ${url}\n` +
      `lastErr=${lastErr instanceof Error ? lastErr.message : String(lastErr)}`
  );
}

function runCommand(label: string, command: string, args: string[], env: Record<string, string>) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: { ...process.env, ...env },
      shell: false,
    });

    child.on("error", (err) => reject(err));
    child.on("exit", (code, signal) => {
      if (code === 0) return resolve();
      reject(new Error(`${label} failed: code=${code}, signal=${signal}`));
    });
  });
}

async function main() {
  // NOTE: demo dev script uses a fixed PORT=3333. We treat 3333 as the default.
  const port = process.env.PORT ? Number(process.env.PORT) : 3333;
  const baseUrl = process.env.BASE_URL ?? `http://localhost:${port}`;
  const healthUrl = `${baseUrl}/api/health`;
  const cssUrl = `${baseUrl}/.mandu/client/globals.css`;

  console.log(`[ATE-E2E] baseUrl=${baseUrl}`);

  // Pre-build CSS once to avoid first-load 404 noise on /.mandu/client/globals.css
  await mkdir(".mandu/client", { recursive: true });
  await runCommand("tailwind prebuild", "./node_modules/.bin/tailwindcss", ["-i", "app/globals.css", "-o", ".mandu/client/globals.css"], {});

  // Start dev server directly (dev:safe wrapper can be unstable in some environments)
  const dev = spawn("./node_modules/.bin/mandu", ["dev", "--watch"], {
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) },
    shell: false,
  });

  const shutdown = async () => {
    if (dev.killed) return;
    dev.kill("SIGTERM");
    await sleep(250);
    if (!dev.killed) dev.kill("SIGKILL");
  };

  try {
    await waitForHealth(healthUrl, 30_000);
    await waitForHealth(cssUrl, 10_000);

    // Run ATE pipeline via mandu CLI (extract→generate→run→report)
    await runCommand(
      "mandu test:auto",
      "bun",
      ["x", "@mandujs/cli", "test:auto", "--ci", "--base-url", baseUrl],
      {}
    );

    console.log("[ATE-E2E] done");
  } finally {
    await shutdown();
  }
}

main().catch((err) => {
  console.error(String(err));
  process.exit(1);
});
