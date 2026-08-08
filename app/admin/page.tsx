import Link from "next/link";
import { headers } from "next/headers";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { AdminConsole } from "@/app/components/admin-console";
import { isAdminUser, listAllOrders, listAllReviews, listAnnouncements, listContactMessages, listProducts, upsertUser } from "@/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marel Yönetim" };

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) {
    const host = (await headers()).get("host") ?? "";
    const loginHref = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)
      ? "https://marel-v2-showroom.bircanyilmaz622.chatgpt.site/signin-with-chatgpt?return_to=%2Fadmin"
      : chatGPTSignInPath("/admin");
    return <main className="admin-gate"><div><span>MAREL / ADMIN</span><h1>Yönetim paneli</h1><p>Ürün, fiyat, görsel ve sipariş yönetimi için yetkili hesabınızla giriş yapın.</p><Link className="button button-gold" href={loginHref}>Yönetici girişi</Link></div></main>;
  }
  if (!isAdminUser(user)) return <main className="admin-gate"><div><span>ERİŞİM REDDEDİLDİ</span><h1>Bu hesap yetkili değil.</h1><p>{user.email} hesabı yönetici izin listesinde bulunmuyor.</p><Link href={chatGPTSignOutPath("/admin")}>Farklı hesapla giriş yap</Link></div></main>;
  await upsertUser(user, "admin");
  const [products, orders, reviews, announcements, contacts] = await Promise.all([listProducts(true), listAllOrders(), listAllReviews(), listAnnouncements(false), listContactMessages()]);
  return <AdminConsole products={products} orders={orders} reviews={reviews} announcements={announcements} contacts={contacts} />;
}
