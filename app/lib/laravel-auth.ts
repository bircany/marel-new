import { cookies } from "next/headers";
import { SOFTRADE_API_URL } from "@/app/lib/softtrade";

export const TOKEN_COOKIE = "marel_token";
export const SESSION_COOKIE = "marel_session";

export type LaravelUser = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
};

export type ApiResult<T> = { ok: true; data: T; status: number } | { ok: false; status: number; message: string; errors?: unknown };

const COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export function getTokenFromRequest(): string | null {
  // Yalnızca sunucu ortamında cookie okuyamadığımız durumlar için fallback.
  return null;
}

export async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(TOKEN_COOKIE)?.value ?? null;
}

export async function setTokenCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

export async function clearTokenCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
}

export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  jar.set(SESSION_COOKIE, id, COOKIE_OPTIONS);
  return id;
}

async function laravel<T>(path: string, init: RequestInit & { token?: boolean; session?: boolean } = {}): Promise<ApiResult<T>> {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (init.body && typeof init.body === "string") headers.set("content-type", "application/json");
  if (init.token) {
    const token = await getToken();
    if (!token) return { ok: false, status: 401, message: "Bu işlem için giriş yapmalısınız." };
    headers.set("authorization", `Bearer ${token}`);
  }
  if (init.session) headers.set("X-Session-ID", await getSessionId());
  const { token, session, ...rest } = init;
  void token;
  void session;
  const response = await fetch(`${SOFTRADE_API_URL}${path}`, { ...rest, headers, cache: "no-store" });
  if (response.status === 204) return { ok: true, data: undefined as T, status: 204 };
  const json = (await response.json().catch(() => null)) as { success?: boolean; message?: string; data?: T; errors?: unknown } | null;
  if (!response.ok || !json?.success) {
    return { ok: false, status: response.status, message: json?.message ?? `API hatası (${response.status})`, errors: json?.errors };
  }
  return { ok: true, data: json.data as T, status: response.status };
}

export async function getCurrentUser(): Promise<LaravelUser | null> {
  const result = await laravel<LaravelUser>("/auth/me", { token: true });
  return result.ok ? result.data : null;
}

export async function getAdminUser(): Promise<LaravelUser | null> {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

export async function requireAdmin(): Promise<LaravelUser | null> {
  const admin = await getAdminUser();
  return admin ?? null;
}

export { laravel };
