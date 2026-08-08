import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminUser, upsertUser } from "@/db";

export async function getAuthorizedAdmin(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  if (!user || !isAdminUser(user)) return null;
  await upsertUser(user, "admin");
  return user;
}

export async function requireAdminApi(): Promise<ChatGPTUser | Response> {
  const admin = await getAuthorizedAdmin();
  return admin ?? Response.json({ error: "Bu işlem için yönetici yetkisi gerekiyor." }, { status: 403 });
}
