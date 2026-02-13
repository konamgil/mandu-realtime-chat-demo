"use client";

import { useEffect, useMemo, useState } from "react";

type ChatRole = "user" | "ai" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  author: string;
  text: string;
  createdAt: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/chat/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => undefined);

    const es = new EventSource("/api/chat/stream");

    es.addEventListener("ready", () => setConnected(true));
    es.addEventListener("message", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as ChatMessage;
      setMessages((prev) => [...prev, payload]);
    });
    es.onerror = () => setConnected(false);

    return () => es.close();
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      setText("");
    } finally {
      setSending(false);
    }
  }

  const status = useMemo(() => (connected ? "연결됨" : "연결중"), [connected]);

  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "24px", fontFamily: "sans-serif" }}>
      <h1>🥟 Mandu Real-time Chat Demo</h1>
      <p>상태: <b>{status}</b> · API: <code>/api/chat/*</code></p>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, height: 420, overflow: "auto", padding: 12, marginBottom: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <b>[{m.role}] {m.author}</b>
            <div>{m.text}</div>
            <small style={{ color: "#666" }}>{new Date(m.createdAt).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
          style={{ flex: 1, padding: 10 }}
        />
        <button disabled={sending} style={{ padding: "10px 16px" }}>
          {sending ? "전송중..." : "전송"}
        </button>
      </form>
    </main>
  );
}
