import Link from "next/link";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { formatMoney } from "@/app/lib/commerce";
import { listOrdersForUser, upsertUser } from "@/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım" };

const statusNames: Record<string, string> = { pending: "Bekliyor", confirmed: "Onaylandı", production: "Üretimde", shipped: "Kargoya verildi", delivered: "Teslim edildi", cancelled: "İptal edildi" };

export default async function AccountPage() {
  const user = await getChatGPTUser();
  if (!user) return <><SiteHeader /><main className="commerce-main shop-container"><section className="account-login-card"><span>MAREL HESABIM</span><h1>Siparişlerinizi tek yerden takip edin.</h1><p>Güvenli giriş yaptıktan sonra sipariş geçmişinizi ve güncel üretim/kargo durumlarını görebilirsiniz.</p><Link className="button button-gold" href={chatGPTSignInPath("/hesabim")}>Güvenli giriş yap</Link></section></main><SiteFooter /></>;
  await upsertUser(user);
  const orders = await listOrdersForUser(user.userId);
  return <><SiteHeader /><main className="commerce-main shop-container"><div className="account-heading"><div><span>HESABIM</span><h1>Merhaba, {user.displayName}</h1><p>{user.email}</p></div><Link href={chatGPTSignOutPath("/")}>Çıkış yap</Link></div><section className="account-orders"><h2>Siparişlerim</h2>{orders.length ? orders.map((order) => <article key={order.id}><div><small>{new Date(order.createdAt).toLocaleDateString("tr-TR")}</small><h3>{order.orderNumber}</h3></div><strong className={`order-status status-${order.status}`}>{statusNames[order.status] ?? order.status}</strong><b>{formatMoney(order.total, order.currency)}</b></article>) : <div className="empty-state"><p>Henüz hesabınıza bağlı sipariş bulunmuyor.</p><Link className="button button-gold" href="/urunler">Alışverişe başla</Link></div>}</section></main><SiteFooter /></>;
}
