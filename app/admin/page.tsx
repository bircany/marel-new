import { getAdminUser } from "@/app/lib/laravel-auth";
import { AdminConsole } from "@/app/components/admin-console";
import { AuthPanel } from "@/app/components/auth-panel";
import { listAnnouncements } from "@/db";
import { stListOrders, stListProducts, stListReviews, stListContactMessages } from "@/app/lib/softtrade";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marel Yönetim" };

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) {
    return <main className="admin-gate"><div><span>MAREL / ADMIN</span><h1>Yönetim paneli</h1><p>Ürün, fiyat, görsel ve sipariş yönetimi için yetkili hesabınızla giriş yapın.</p><AuthPanel heading="Yönetici girişi" subheading="Yalnızca yetkili Marel yönetici hesapları paneli görüntüleyebilir." successRoute="/admin" /></div></main>;
  }

  const [products, orders, reviews, announcements, contacts] = await Promise.all([
    stListProducts(true, "Marel"),
    stListOrders(),
    stListReviews(),
    listAnnouncements(false),
    stListContactMessages(),
  ]);
  return <AdminConsole products={products} orders={orders} reviews={reviews} announcements={announcements} contacts={contacts} />;
}
