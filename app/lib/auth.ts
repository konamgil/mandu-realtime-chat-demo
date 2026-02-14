export const AUTH_STORAGE_KEY = "mandu-chat-demo.session";

export type DemoAccount = {
  email: string;
  password: string;
  name: string;
};

export type AuthSession = {
  email: string;
  name: string;
  loggedInAt: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "demo@mandu.dev", password: "password", name: "Demo User" },
];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function authenticate(email: string, password: string): AuthSession | null {
  const normalizedEmail = normalizeEmail(email);
  const account = DEMO_ACCOUNTS.find(
    (candidate) => candidate.email === normalizedEmail && candidate.password === password,
  );

  if (!account) return null;

  return {
    email: account.email,
    name: account.name,
    loggedInAt: new Date().toISOString(),
  };
}

export function parseSession(raw: string | null | undefined): AuthSession | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.email || !parsed.name || !parsed.loggedInAt) return null;

    return {
      email: String(parsed.email),
      name: String(parsed.name),
      loggedInAt: String(parsed.loggedInAt),
    };
  } catch {
    return null;
  }
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  return parseSession(window.localStorage.getItem(AUTH_STORAGE_KEY));
}

export function persistSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
