import { getCurrentUser } from "@/app/lib/laravel-auth";
import { AuthPanel } from "@/app/components/auth-panel";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { GuestOrderTracker, OrderTracker } from "@/app/components/order-tracker";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş Takip", robots: { index: false, follow: false } };

export default async function TrackingPage() {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader />
      <main className="tracking-page">
        <div className="shop-container">
          {user ? (
            <OrderTracker user={user} />
          ) : (
            <div className="tracking-guest">
              <div className="tracking-story">
                <span>MAREL SİPARİŞ TAKİBİ</span>
                <h1>Üretimden teslimata, her adım burada.</h1>
                <p>Sipariş numaranız ve e-postanızla misafir takip yapın veya hesabınıza giriş yapın.</p>
                <div className="tracking-steps">
                  <article>
                    <b>01</b>
                    <span>
                      <strong>Sipariş onayı</strong>
                      <small>Ölçü, kumaş ve profil teyidi</small>
                    </span>
                  </article>
                  <article>
                    <b>02</b>
                    <span>
                      <strong>Ölçüye özel üretim</strong>
                      <small>Marel atölyesinde hazırlık</small>
                    </span>
                  </article>
                  <article>
                    <b>03</b>
                    <span>
                      <strong>Kargo ve teslimat</strong>
                      <small>Takip numarası ile canlı durum</small>
                    </span>
                  </article>
                </div>
              </div>
              <div className="tracking-panel tracking-guest-panel">
                <GuestOrderTracker />
                <div className="tracking-guest-divider">
                  <span>veya</span>
                </div>
                <AuthPanel
                  heading="Hesabınızdan görün."
                  subheading="Giriş yaparak tüm siparişlerinizin güncel durumunu tek ekrandan takip edin."
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
