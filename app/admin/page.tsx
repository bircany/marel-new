import { getAdminUser } from "@/app/lib/laravel-auth";
import { AdminConsole } from "@/app/components/admin-console";
import { AdminLogin } from "@/app/components/admin-login";
import { listAnnouncements } from "@/db";
import { stListOrders, stListProducts, stListReviews, stListContactMessages } from "@/app/lib/softtrade";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marel Yönetim Portalı", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) {
    return <AdminLogin />;
  }

  const [products, orders, reviews, announcements, contacts] = await Promise.all([
    stListProducts(true, "Marel"),
    stListOrders(),
    stListReviews(),
    listAnnouncements(false),
    stListContactMessages(),
  ]);
  return <AdminConsole products={products} orders={orders} reviews={reviews} announcements={announcements} contacts={contacts} adminUser={admin} />;
}
