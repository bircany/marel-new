import { getAuthorizedAdmin } from "@/app/lib/admin-auth";
import { AdminLogin } from "@/app/components/admin-login";
import { AdminShell } from "@/app/admin/components/AdminShell";
import { listOrdersWithDetails } from "@/db";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sipariş Yönetimi | Marel Yönetim",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return <AdminLogin />;
  }

  const orders = await listOrdersWithDetails();
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "awaiting_measurement").length;

  return (
    <AdminShell adminUser={admin} pendingOrdersCount={pendingCount}>
      <OrdersClient initialOrders={orders} />
    </AdminShell>
  );
}
