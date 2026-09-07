import { getAdminUser } from "@/app/lib/laravel-auth";
import { AdminConsole } from "@/app/components/admin-console";
import { AdminLogin } from "@/app/components/admin-login";
import {
  listAnnouncements,
  listProducts,
  listOrdersWithDetails,
  listCouponsFromDb,
  getSettingsFromDb,
  listCustomersFromDb,
} from "@/db";
import { stListReviews, stListContactMessages } from "@/app/lib/softtrade";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marel Yönetim Portalı", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) {
    return <AdminLogin />;
  }

  const [products, orders, reviews, announcements, contacts, coupons, settings, customers] = await Promise.all([
    listProducts(true),
    listOrdersWithDetails(),
    stListReviews(),
    listAnnouncements(false),
    stListContactMessages(),
    listCouponsFromDb(),
    getSettingsFromDb(),
    listCustomersFromDb(),
  ]);

  return (
    <AdminConsole
      products={products}
      orders={orders}
      reviews={reviews}
      announcements={announcements}
      contacts={contacts}
      initialCoupons={coupons}
      initialSettings={settings}
      initialCustomers={customers}
      adminUser={admin}
    />
  );
}
