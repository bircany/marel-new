import Link from "next/link";
import { getCurrentUser, laravel } from "@/app/lib/laravel-auth";
import { AuthPanel } from "@/app/components/auth-panel";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { CustomerReviews } from "@/app/components/customer-reviews";
import { SignOutButton } from "@/app/components/sign-out-button";
import { formatMoney } from "@/app/lib/commerce";
import { stListProducts } from "@/app/lib/softtrade";
import type { OrderPayload } from "@/app/api/orders/route";
import type { ReviewPayload } from "@/app/api/reviews/route";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım" };

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
    <main className="account-guest-page">
      <section className="account-guest-shell shop-container">
        <div className="account-guest-story">
          <span className="account-eyebrow">MAREL HESABIM</span>
          <h1>Eviniz için seçtikleriniz, her an elinizin altında.</h1>
          <p>Siparişinizin ölçü teyidinden üretime, kargodan teslimata kadar tüm süreci tek ekrandan izleyin.</p>
          <div className="account-benefit-list">
            <article><b>01</b><div><strong>Anlık sipariş durumu</strong><small>Üretim ve kargo adımlarını kolayca takip edin.</small></div></article>
            <article><b>02</b><div><strong>Güvenli hesap erişimi</strong><small>E-posta ve şifrenizle hesabınıza güvenle giriş yapın.</small></div></article>
            <article><b>03</b><div><strong>Tüm Marel siparişleri</strong><small>Geçmiş ve devam eden siparişlerinizi bir arada görün.</small></div></article>
          </div>
        </div>
        <AuthPanel />
      </section>

      <section className="account-trust-row shop-container" aria-label="Marel hesap avantajları">
        <span><b>Güvenli giriş</b><small>Korumalı hesap erişimi</small></span>
        <span><b>Canlı durum</b><small>Sipariş adımları tek ekranda</small></span>
        <span><b>Marel desteği</b><small>İhtiyaç duyduğunuzda yanınızda</small></span>
      </section>
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
      <div className="account-order-actions"><span>{order.status === "delivered" ? "Siparişiniz teslim edildi." : "Siparişiniz Marel ekibi tarafından takip ediliyor."}</span><Link href="/siparis-takip">Detayları gör →</Link></div>
    </article>
  );
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <><SiteHeader /><GuestAccount /><SiteFooter /></>;
  }

  const [orders, products, reviews] = await Promise.all([
    laravel<OrderPayload[]>("/orders", { token: true }).then((r) => r.ok ? r.data : []).catch(() => []),
    stListProducts(false, "Marel"),
    laravel<ReviewPayload[]>("/reviews/mine", { token: true }).then((r) => r.ok ? r.data : []).catch(() => []),
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
          <nav aria-label="Hesabım menüsü"><a className="active" href="#siparisler">Siparişlerim <span>{orders.length}</span></a><a href="#yorumlar">Yorumlarım <span>{reviews.length}</span></a><Link href="/siparis-takip">Sipariş takip <span>↗</span></Link><a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">Destek <span>↗</span></a></nav>
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
            {orders.length ? orders.map((order) => <OrderCard key={order.id} order={order} />) : <div className="account-empty-orders"><div aria-hidden="true">M</div><h3>Henüz bir siparişiniz yok.</h3><p>Ölçünüze özel Marel ürünlerini keşfedin; ilk siparişiniz burada adım adım görünsün.</p><Link className="account-primary-action" href="/urunler"><span>Ürünleri keşfet</span><b aria-hidden="true">→</b></Link></div>}
          </div>
          <CustomerReviews products={products.map(({ id, name }) => ({ id, name }))} reviews={reviews} />
        </section>
      </div>
    </main><SiteFooter /></>
  );
}
