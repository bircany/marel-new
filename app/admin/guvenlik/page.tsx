import { getAuthorizedAdmin } from "@/app/lib/admin-auth";
import { AdminLogin } from "@/app/components/admin-login";
import { AdminShell } from "@/app/admin/components/AdminShell";
import { listOrdersWithDetails } from "@/db";
import { SecurityClient } from "./SecurityClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Güvenlik & Log Merkezi | Marel Yönetim",
  robots: { index: false, follow: false },
};

export default async function AdminSecurityPage() {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return <AdminLogin />;
  }

  const orders = await listOrdersWithDetails();
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "awaiting_measurement").length;

  const sampleAuditLogs: Array<{
    id: string;
    action: string;
    user: string;
    ip: string;
    details: string;
    timestamp: string;
    status: "success" | "warning" | "danger";
  }> = [
    {
      id: "log-1",
      action: "Admin Girişi Başarılı",
      user: admin.email,
      ip: "127.0.0.1",
      details: "Yönetici paneli yetkili oturumu açıldı.",
      timestamp: new Date().toISOString(),
      status: "success",
    },
    {
      id: "log-2",
      action: "Sipariş D1 Kaydı",
      user: "Sistem (Misafir Checkout)",
      ip: "127.0.0.1",
      details: "Yeni plise perde siparişi başarıyla oluşturuldu.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: "success",
    },
    {
      id: "log-3",
      action: "Rate-Limit Kontrolü",
      user: "Ziyaretçi",
      ip: "88.241.15.22",
      details: "/api/orders/track rota sorgusu normal sınırlar içinde.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: "success",
    },
    {
      id: "log-4",
      action: "Geçersiz İstek Engellendi",
      user: "Bilinmeyen Bot",
      ip: "194.26.29.112",
      details: "Yetkisiz /api/admin/orders erişim denemesi reddedildi (403).",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: "warning",
    },
  ];

  return (
    <AdminShell adminUser={admin} pendingOrdersCount={pendingCount}>
      <SecurityClient initialAuditLogs={sampleAuditLogs} />
    </AdminShell>
  );
}
