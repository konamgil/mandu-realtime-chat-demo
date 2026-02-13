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
  const [error, setError] = useState<string | null>(null);
  const [snapshotLimit, setSnapshotLimit] = useState<number>(50);

  const upsertMessages = (incoming: ChatMessage[]) => {
    setMessages((prev) => {
      if (!incoming.length) return prev;
      const seen = new Set(prev.map((message) => message.id));
      const next = [...prev];

      for (const message of incoming) {
        if (seen.has(message.id)) continue;
        seen.add(message.id);
        next.push(message);
      }
      return next;
    });
  };

  useEffect(() => {
    setMessages([]);
    let latestMessageId: string | undefined;

    const syncMissedMessages = async () => {
      const search = new URLSearchParams();
      if (latestMessageId) {
        search.set("sinceId", latestMessageId);
      } else {
        search.set("limit", String(snapshotLimit));
      }
      const qs = search.toString();
      const response = await fetch(`/api/chat/messages${qs ? `?${qs}` : ""}`);
      const data = await response.json();
      const incoming = (data.messages ?? []) as ChatMessage[];
      if (incoming.length > 0) {
        latestMessageId = incoming[incoming.length - 1].id;
      }
      upsertMessages(incoming);
    };

    syncMissedMessages().catch(() => undefined);

    const es = new EventSource("/api/chat/stream");

    es.addEventListener("ready", () => {
      setConnected(true);
      syncMissedMessages().catch(() => undefined);
    });

    es.addEventListener("message", (event) => {
      const payload = JSON.parse((event as MessageEvent).data) as ChatMessage;
      latestMessageId = payload.id;
      upsertMessages([payload]);
    });

    es.onerror = () => setConnected(false);

    return () => es.close();
  }, [snapshotLimit]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || trimmed.length > 500) return;

    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload?.error ?? "메시지 전송 실패");
        return;
      }
      setText("");
    } finally {
      setSending(false);
    }
  }

  const status = useMemo(() => (connected ? "연결됨" : "연결중"), [connected]);
  const remainingChars = 500 - text.length;

  return (
    <main style={{ maxWidth: 840, margin: "0 auto", padding: "24px", fontFamily: "sans-serif" }}>
      <h1>🥟 Mandu Real-time Chat Demo</h1>
      <p>상태: <b>{status}</b> · API: <code>/api/chat/*</code></p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <label>
          초기 로드 개수:&nbsp;
          <select value={snapshotLimit} onChange={(e) => setSnapshotLimit(Number(e.target.value))}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <small style={{ color: "#666" }}>값 변경 시 스트림을 재연결해 최근 메시지 스냅샷을 다시 가져옵니다.</small>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, height: 420, overflow: "auto", padding: 12, marginBottom: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <b>[{m.role}] {m.author}</b>
            <div>{m.text}</div>
            <small style={{ color: "#666" }}>{new Date(m.createdAt).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {error ? <p style={{ color: "crimson", marginTop: 0 }}>{error}</p> : null}

      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              void sendMessage(e);
            }
          }}
          placeholder="메시지를 입력하세요"
          style={{ flex: 1, padding: 10 }}
        />
        <small style={{ color: remainingChars < 0 ? "crimson" : "#666", minWidth: 72, textAlign: "right" }}>
          {remainingChars}자
        </small>
        <button disabled={sending || remainingChars < 0} style={{ padding: "10px 16px" }}>
          {sending ? "전송중..." : "전송"}
        </button>
      </form>
    </main>
  );
}
