"use client";

import { useState } from "react";
import { DEMO_ACCOUNTS, authenticate, persistSession, type AuthSession } from "../lib/auth";

type LoginScreenProps = {
  title?: string;
  description?: string;
  onLogin?: (session: AuthSession) => void;
};

export default function LoginScreen({
  title = "🔐 로그인",
  description = "테스트 계정으로 로그인 후 채팅을 사용할 수 있습니다.",
  onLogin,
}: LoginScreenProps) {
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0]?.email ?? "");
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0]?.password ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const session = authenticate(email, password);

    if (!session) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    persistSession(session);
    setError(null);
    onLogin?.(session);

    if (!onLogin) {
      window.location.href = "/";
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>{title}</h1>
      <p>{description}</p>

      <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <b>테스트 계정</b>
        <div>email: <code>{DEMO_ACCOUNTS[0].email}</code></div>
        <div>password: <code>{DEMO_ACCOUNTS[0].password}</code></div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4 }}>
          이메일
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="demo@mandu.dev"
            style={{ padding: 10 }}
            required
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
            style={{ padding: 10 }}
            required
          />
        </label>

        {error ? <p style={{ color: "crimson", margin: 0 }}>{error}</p> : null}

        <button type="submit" style={{ padding: "10px 16px" }}>로그인</button>
      </form>
    </main>
  );
}
