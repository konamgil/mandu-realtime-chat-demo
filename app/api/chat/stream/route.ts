import { subscribe } from "../../../../src/server/chat/store";

export function GET(request: Request) {
  const encoder = new TextEncoder();
  let cleanupRef: (() => void) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      let unsubscribe: (() => void) | undefined;
      let ping: ReturnType<typeof setInterval> | undefined;

      const cleanup = () => {
        if (closed) return;
        closed = true;

        if (ping) {
          clearInterval(ping);
          ping = undefined;
        }

        if (unsubscribe) {
          unsubscribe();
          unsubscribe = undefined;
        }

        request.signal.removeEventListener("abort", onAbort);
      };

      const safeEnqueue = (chunk: string) => {
        if (closed) return false;
        try {
          controller.enqueue(encoder.encode(chunk));
          return true;
        } catch {
          cleanup();
          return false;
        }
      };

      const send = (event: string, data: unknown) => {
        if (!safeEnqueue(`event: ${event}\n`)) return false;
        return safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const onAbort = () => cleanup();
      request.signal.addEventListener("abort", onAbort, { once: true });

      cleanupRef = cleanup;

      if (!send("ready", { ok: true, ts: Date.now() })) {
        cleanup();
        return;
      }

      unsubscribe = subscribe((message) => {
        if (!send("message", message)) {
          cleanup();
        }
      });

      ping = setInterval(() => {
        if (!send("ping", { ts: Date.now() })) {
          cleanup();
        }
      }, 15000);
    },
    cancel() {
      // Called when client disconnects; cleanup is idempotent.
      cleanupRef?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
