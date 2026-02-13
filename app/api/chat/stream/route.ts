import { subscribe } from "../../../../src/server/chat/store";

export function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send("ready", { ok: true, ts: Date.now() });

      const unsubscribe = subscribe((message) => {
        send("message", message);
      });

      const ping = setInterval(() => {
        send("ping", { ts: Date.now() });
      }, 15000);

      (controller as unknown as { __cleanup?: () => void }).__cleanup = () => {
        clearInterval(ping);
        unsubscribe();
      };
    },
    cancel() {
      // no-op
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
