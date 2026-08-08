import Link from "next/link";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { AdminConsole } from "@/app/components/admin-console";
import { isAdminUser, listAllOrders, listProducts, upsertUser } from "@/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marel Yönetim" };

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) return <main className="admin-gate"><div><span>MAREL / ADMIN</span><h1>Yönetim paneli</h1><p>Ürün, fiyat, görsel ve sipariş yönetimi için yetkili hesabınızla giriş yapın.</p><Link className="button button-gold" href={chatGPTSignInPath("/admin")}>Yönetici girişi</Link></div></main>;
  if (!isAdminUser(user)) return <main className="admin-gate"><div><span>ERİŞİM REDDEDİLDİ</span><h1>Bu hesap yetkili değil.</h1><p>{user.email} hesabı yönetici izin listesinde bulunmuyor.</p><Link href={chatGPTSignOutPath("/admin")}>Farklı hesapla giriş yap</Link></div></main>;
  await upsertUser(user, "admin");
  const [products, orders] = await Promise.all([listProducts(true), listAllOrders()]);
  return <AdminConsole products={products} orders={orders} />;
}
