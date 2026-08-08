import Link from "next/link";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { formatMoney } from "@/app/lib/commerce";
import { listOrdersForUser, upsertUser, type OrderRecord } from "@/db";

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
            <article><b>02</b><div><strong>Güvenli hesap erişimi</strong><small>Şifre oluşturmadan güvenli hesabınızla giriş yapın.</small></div></article>
            <article><b>03</b><div><strong>Tüm Marel siparişleri</strong><small>Geçmiş ve devam eden siparişlerinizi bir arada görün.</small></div></article>
          </div>
        </div>

        <div className="account-auth-panel">
          <div className="account-mark" aria-hidden="true">M</div>
          <span className="account-auth-kicker">Marel müşteri hesabı</span>
          <h2>Tekrar hoş geldiniz.</h2>
          <p>Hesabınıza bağlanan siparişleri görüntülemek için güvenli giriş yapın.</p>
          <Link className="account-primary-action" href={chatGPTSignInPath("/hesabim")}>
            <span>Hesabıma güvenli giriş yap</span><b aria-hidden="true">→</b>
          </Link>
          <div className="account-auth-note"><i aria-hidden="true">✓</i><span>Ayrı bir kayıt veya yeni şifre gerekmez.</span></div>
          <div className="account-panel-divider"><span>Yardıma mı ihtiyacınız var?</span></div>
          <a className="account-support-link" href="https://wa.me/905467356602" target="_blank" rel="noreferrer">
            <span><b>WhatsApp desteği</b><small>Marel danışmanına hızlıca ulaşın</small></span><strong aria-hidden="true">↗</strong>
          </a>
        </div>
      </section>

      <section className="account-trust-row shop-container" aria-label="Marel hesap avantajları">
        <span><b>Güvenli giriş</b><small>Korumalı hesap erişimi</small></span>
        <span><b>Canlı durum</b><small>Sipariş adımları tek ekranda</small></span>
        <span><b>Marel desteği</b><small>İhtiyaç duyduğunuzda yanınızda</small></span>
      </section>
    </main>
  );
}

function OrderCard({ order }: { order: OrderRecord }) {
  const progress = progressByStatus[order.status] ?? 0;
  return (
    <article className="account-order-card">
      <div className="account-order-topline">
        <div><small>SİPARİŞ NUMARASI</small><h3>{order.orderNumber}</h3></div>
        <strong className={`order-status status-${order.status}`}>{statusNames[order.status] ?? order.status}</strong>
      </div>
      <div className="account-order-meta">
        <span><small>Sipariş tarihi</small><b>{new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</b></span>
        <span><small>Teslimat</small><b>{order.shippingAddress}</b></span>
        <span><small>Toplam</small><b>{formatMoney(order.total, order.currency)}</b></span>
      </div>
      {order.status !== "cancelled" && <div className="account-order-progress" aria-label={`Sipariş ilerlemesi yüzde ${progress}`}><i style={{ width: `${progress}%` }} /></div>}
      <div className="account-order-actions"><span>{order.status === "delivered" ? "Siparişiniz teslim edildi." : "Siparişiniz Marel ekibi tarafından takip ediliyor."}</span><Link href={`/siparis-takip?order=${encodeURIComponent(order.orderNumber)}`}>Detayları gör →</Link></div>
    </article>
  );
}

export default async function AccountPage() {
  const user = await getChatGPTUser();
  if (!user) return <><SiteHeader /><GuestAccount /><SiteFooter /></>;

  await upsertUser(user);
  const orders = await listOrdersForUser(user.userId);
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("tr-TR")).join("") || "M";

  return (
    <><SiteHeader /><main className="account-dashboard-page">
      <div className="shop-container account-dashboard-heading">
        <div><span className="account-eyebrow">MAREL HESABIM</span><h1>Merhaba, {user.displayName}</h1><p>Siparişlerinizi ve hesabınıza ait güncel bilgileri buradan yönetebilirsiniz.</p></div>
        <Link className="account-signout" href={chatGPTSignOutPath("/")}>Güvenli çıkış ↗</Link>
      </div>

      <div className="shop-container account-dashboard-grid">
        <aside className="account-profile-card">
          <div className="account-avatar" aria-hidden="true">{initials}</div>
          <h2>{user.displayName}</h2><p>{user.email}</p>
          <nav aria-label="Hesabım menüsü"><a className="active" href="#siparisler">Siparişlerim <span>{orders.length}</span></a><Link href="/siparis-takip">Sipariş takip <span>↗</span></Link><a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">Destek <span>↗</span></a></nav>
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
        </section>
      </div>
    </main><SiteFooter /></>
  );
}
