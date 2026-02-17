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
    <main className="max-w-md mx-auto mt-20 p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 border">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{description}</p>

        <div className="bg-secondary/30 border border-border rounded-lg p-4 mb-6">
          <div className="font-semibold mb-2">테스트 계정</div>
          <div className="text-sm space-y-1">
            <div>
              email: <code className="px-2 py-0.5 bg-white rounded text-xs font-mono">{DEMO_ACCOUNTS[0].email}</code>
            </div>
            <div>
              password: <code className="px-2 py-0.5 bg-white rounded text-xs font-mono">{DEMO_ACCOUNTS[0].password}</code>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="demo@mandu.dev"
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
              className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </label>

          {error && (
            <p className="text-red-600 text-sm p-2 bg-red-50 rounded">{error}</p>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            로그인
          </button>
        </form>
      </div>
    </main>
  );
}
