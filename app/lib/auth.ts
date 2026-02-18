import { z } from "zod";

export const AUTH_STORAGE_KEY = "mandu-chat-demo.session";

export type DemoAccount = {
  email: string;
  password: string;
  name: string;
};

export const AuthSessionSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  loggedInAt: z.string(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

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
    const result = AuthSessionSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
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
