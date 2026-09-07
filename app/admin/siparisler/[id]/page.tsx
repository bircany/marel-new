import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthorizedAdmin } from "@/app/lib/admin-auth";
import { AdminLogin } from "@/app/components/admin-login";
import { AdminShell } from "@/app/admin/components/AdminShell";
import { getOrderDetailsById } from "@/db";
import { OrderDetailClient } from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Sipariş #${id} Detayı | Marel Yönetim`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAuthorizedAdmin();
  if (!admin) {
    return <AdminLogin />;
  }

  const { id } = await params;
  const order = await getOrderDetailsById(id);

  if (!order) {
    return (
      <AdminShell adminUser={admin}>
        <div
          style={{
            maxWidth: 600,
            margin: "60px auto",
            backgroundColor: "#ffffff",
            padding: "36px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔍</div>
          <h2 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>Sipariş Bulunamadı</h2>
          <p style={{ color: "#64748b", margin: "0 0 20px 0" }}>
            Aradığınız sipariş veritabanında mevcut değil veya silinmiş olabilir.
          </p>
          <Link
            href="/admin/siparisler"
            style={{
              display: "inline-block",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Tüm Siparişlere Dön
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell adminUser={admin}>
      <OrderDetailClient order={order} />
    </AdminShell>
  );
}
