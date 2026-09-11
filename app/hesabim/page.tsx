import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, laravel } from "@/app/lib/laravel-auth";
import { AuthPanel } from "@/app/components/auth-panel";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { SignOutButton } from "@/app/components/sign-out-button";
import { formatMoney } from "@/app/lib/commerce";
import { stListProducts } from "@/app/lib/softtrade";
import type { OrderPayload } from "@/app/api/orders/route";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım | Marel", robots: { index: false, follow: false } };

const statusNames: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  production: "Üretimde",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
};

const progressByStatus: Record<string, number> = {
  pending: 12,
  confirmed: 34,
  production: 58,
  shipped: 82,
  delivered: 100,
  cancelled: 0,
};

function GuestAccount() {
  return (
    <main className="simple-account-page">
      <div className="simple-account-container">
        <div className="simple-account-brand">
          <Image
            unoptimized
            src="/images/marel-logo.png"
            alt="Marel"
            width={160}
            height={36}
            style={{ objectFit: "contain" }}
          />
          <p>Hesabınıza giriş yaparak siparişlerinizi takip edin.</p>
        </div>
        <AuthPanel />
      </div>
    </main>
  );
}

function OrderCard({ order }: { order: OrderPayload }) {
  const progress = progressByStatus[order.status] ?? 0;
  const primaryItem = order.items?.[0];
  return (
    <article className="account-order-card">
      <div className="account-order-topline">
        <div><small>SİPARİŞ NUMARASI</small><h3>{order.order_number}</h3></div>
        <strong className={`order-status status-${order.status}`}>{statusNames[order.status] ?? order.status}</strong>
      </div>
      <div className="account-order-meta">
        <span><small>Sipariş tarihi</small><b>{new Date(order.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</b></span>
        <span><small>Ürün</small><b>{primaryItem ? `${primaryItem.product_name ?? "Ürün"}${(order.items?.length ?? 0) > 1 ? ` +${(order.items?.length ?? 0) - 1} ürün` : ""}` : "—"}</b></span>
        <span><small>Toplam</small><b>{formatMoney(Math.round((order.total + Number.EPSILON) * 100))}</b></span>
      </div>
      {order.status !== "cancelled" && <div className="account-order-progress" aria-label={`Sipariş ilerlemesi yüzde ${progress}`}><i style={{ width: `${progress}%` }} /></div>}
      <div className="account-order-actions"><span>{order.status === "delivered" ? "Siparişiniz teslim edildi." : "Siparişiniz takip ediliyor."}</span><a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">WhatsApp Destek →</a></div>
    </article>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <><SiteHeader /><GuestAccount /><SiteFooter /></>;
  }

  const [orders, products] = await Promise.all([
    laravel<OrderPayload[]>("/orders", { token: true }).then((r) => r.ok ? r.data : []).catch(() => []),
    stListProducts(false, "Marel"),
  ]);
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const initials = user.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("tr-TR")).join("") || "M";

  return (
    <><SiteHeader /><main className="account-dashboard-page">
      <div className="shop-container account-dashboard-heading">
        <div><span className="account-eyebrow">MAREL HESABIM</span><h1>Merhaba, {user.full_name}</h1><p>Siparişlerinizi ve hesabınıza ait güncel bilgileri buradan yönetebilirsiniz.</p></div>
        <SignOutButton className="account-signout" />
      </div>

      <div className="shop-container account-dashboard-grid">
        <aside className="account-profile-card">
          <div className="account-avatar" aria-hidden="true">{initials}</div>
          <h2>{user.full_name}</h2><p>{user.email}</p>
          <nav aria-label="Hesabım menüsü"><a className="active" href="#siparisler">Siparişlerim <span>{orders.length}</span></a><a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">Destek <span>↗</span></a></nav>
          <small>Hesap bilgileriniz güvenli oturumunuz üzerinden alınır.</small>
        </aside>

        <section className="account-dashboard-content" id="siparisler">
          <div className="account-stat-grid">
            <article><small>TÜM SİPARİŞLER</small><strong>{orders.length}</strong><span>Hesabınıza bağlı toplam sipariş</span></article>
            <article><small>DEVAM EDEN</small><strong>{activeOrders}</strong><span>Hazırlık veya teslimat sürecinde</span></article>
            <article><small>TAMAMLANAN</small><strong>{deliveredOrders}</strong><span>Başarıyla teslim edilen</span></article>
          </div>

          <div className="account-section-title"><div><span>SON HAREKETLER</span><h2>Siparişlerim</h2></div><Link href="/urunler">Alışverişe devam et →</Link></div>
          <div className="account-order-list">
            {orders.length ? orders.map((order) => <OrderCard key={order.id} order={order} />) : <div className="account-empty-orders"><h3>Henüz bir siparişiniz yok.</h3><p>Ölçünüze özel Marel ürünlerini keşfedin.</p><Link className="account-primary-action" href="/urunler"><span>Ürünleri keşfet</span><b aria-hidden="true">→</b></Link></div>}
          </div>
        </section>
      </div>
    </main><SiteFooter /></>
  );
}
