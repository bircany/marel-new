import { getAuthorizedAdmin } from "@/app/lib/admin-auth";
import { AdminLogin } from "@/app/components/admin-login";
import { AdminShell } from "@/app/admin/components/AdminShell";
import { getCustomerByIdFromDb, listOrdersWithDetails } from "@/db";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthorizedAdmin();
  if (!admin) return <AdminLogin />;
  const customer = await getCustomerByIdFromDb((await params).id);
  if (!customer) return <AdminShell adminUser={admin}><p>Müşteri bulunamadı.</p></AdminShell>;
  const orders = (await listOrdersWithDetails()).filter((order) => order.email.toLowerCase() === customer.email.toLowerCase());
  return (
    <AdminShell adminUser={admin} pendingOrdersCount={orders.filter((order) => order.status === "pending").length}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "#64748b" }}>CRM / Müşteri Detayı</p>
        <h1>{customer.fullName}</h1>
        <p>{customer.email} · {customer.phone || "Telefon yok"} · {customer.status}</p>
        <h2>Sipariş geçmişi ({orders.length})</h2>
        {orders.length === 0 ? <p>Henüz sipariş bulunmuyor.</p> : orders.map((order) => (
          <article key={order.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 8 }}>
            <strong>{order.orderNumber}</strong> · {order.status} · {order.total.toLocaleString("tr-TR")} {order.currency}
          </article>
        ))}
        <h2>En çok satın alınanlar</h2>
        {customer.favoriteProducts.length ? customer.favoriteProducts.map((product) => <p key={product.name}>{product.name} ({product.quantity})</p>) : <p>Ürün kalemi bulunmuyor.</p>}
      </div>
    </AdminShell>
  );
}
