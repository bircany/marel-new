import { getAuthorizedAdmin } from "@/app/lib/admin-auth";
import { AdminLogin } from "@/app/components/admin-login";
import { AdminShell } from "@/app/admin/components/AdminShell";
import { listCustomersFromDb, listOrdersWithDetails } from "@/db";
import { CustomersClient } from "./CustomersClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Müşteri Yönetimi | Marel Yönetim",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return <AdminLogin />;
  }

  const [customers, orders] = await Promise.all([
    listCustomersFromDb(),
    listOrdersWithDetails(),
  ]);

  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "awaiting_measurement").length;

  return (
    <AdminShell adminUser={admin} pendingOrdersCount={pendingCount}>
      <CustomersClient initialCustomers={customers} />
    </AdminShell>
  );
}
