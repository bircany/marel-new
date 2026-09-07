import { getAuthorizedAdmin } from "@/app/lib/admin-auth";
import { AdminLogin } from "@/app/components/admin-login";
import { AdminShell } from "@/app/admin/components/AdminShell";
import { getSettingsFromDb, listOrdersWithDetails } from "@/db";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Site Ayarları | Marel Yönetim",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return <AdminLogin />;
  }

  const [settings, orders] = await Promise.all([
    getSettingsFromDb(),
    listOrdersWithDetails(),
  ]);

  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "awaiting_measurement").length;

  return (
    <AdminShell adminUser={admin} pendingOrdersCount={pendingCount}>
      <SettingsClient initialSettings={settings} />
    </AdminShell>
  );
}
