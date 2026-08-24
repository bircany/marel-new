import { getAdminUser, type LaravelUser } from "@/app/lib/laravel-auth";

export async function getAuthorizedAdmin(): Promise<LaravelUser | null> {
  return getAdminUser();
}

export async function requireAdminApi(): Promise<LaravelUser | Response> {
  const admin = await getAdminUser();
  return admin ?? Response.json({ error: "Bu işlem için yönetici yetkisi gerekiyor." }, { status: 403 });
}
