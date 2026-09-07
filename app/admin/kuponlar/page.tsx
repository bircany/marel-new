import { getAuthorizedAdmin } from "@/app/lib/admin-auth";
import { AdminLogin } from "@/app/components/admin-login";
import { AdminShell } from "@/app/admin/components/AdminShell";
import { listCouponsFromDb, listOrdersWithDetails } from "@/db";
import { CouponsClient } from "./CouponsClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kupon Yönetimi | Marel Yönetim",
  robots: { index: false, follow: false },
};

export default async function AdminCouponsPage() {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return <AdminLogin />;
  }

  const [coupons, orders] = await Promise.all([
    listCouponsFromDb(),
    listOrdersWithDetails(),
  ]);

  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "awaiting_measurement").length;

  return (
    <AdminShell adminUser={admin} pendingOrdersCount={pendingCount}>
      <CouponsClient initialCoupons={coupons} />
    </AdminShell>
  );
}
