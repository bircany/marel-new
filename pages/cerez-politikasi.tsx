import Link from "next/link";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { LegalSidebar } from "@/app/components/legal-sidebar";
import { absoluteUrl } from "@/app/lib/site";

export const metadata = {
  title: "Çerez (Cookie) Politikası | Marel Plise Perde",
  description: "Marel web sitesinde kullanılan çerez türleri, kullanım amaçları ve çerez yönetimi hakkında bilgilendirme.",
  alternates: { canonical: absoluteUrl("/cerez-politikasi") },
};

export default function CookiePolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <section className="legal-hero shop-container">
          <span>ŞEFFAFLIK & ÇEREZ YÖNETİMİ</span>
          <h1>Çerez (Cookie) Politikası</h1>
          <p>Marel Dijital Platformlarında Kullanılan Çerezler Hakkında Bilgilendirme</p>
        </section>

        <div className="legal-layout shop-container">
          <LegalSidebar currentPath="/cerez-politikasi" />

          <article className="legal-content-body">
            <section>
              <h2>1. Çerez Nedir?</h2>
              <p>
                Çerezler (Cookies), web sitelerini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza veya ağ
                sunucusuna depolanan küçük metin dosyalarıdır. Çerezler, web sitemizin daha verimli çalışmasını ve size
                kişiselleştirilmiş bir alışveriş deneyimi sunulmasını sağlar.
              </p>
            </section>

            <section>
              <h2>2. Kullanılan Çerez Türleri ve Amaçları</h2>
              <ul>
                <li>
                  <strong>Zorunlu Çerezler:</strong> Alışveriş sepetinizin hatırlanması, kullanıcı oturumunun açık
                  tutulması ve güvenli ödeme/sipariş adımlarının tamamlanması için teknik olarak zorunludur.
                </li>
                <li>
                  <strong>İşlevsel Çerezler:</strong> Dil tercihiniz, seçtiğiniz kumaş filtreleri ve son incelediğiniz
                  ölçülerin hatırlanmasını sağlar.
                </li>
                <li>
                  <strong>Performans ve Analiz Çerezleri:</strong> Sitemizin hızını ölçmek, hangi ürün serilerinin daha
                  çok ilgi gördüğünü anlamak ve kullanıcı deneyimini iyileştirmek için anonim olarak toplanır.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Çerez Tercihlerini Yönetme</h2>
              <p>
                Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi dilediğiniz zaman
                özelleştirebilirsiniz. Zorunlu çerezlerin kapatılması durumunda sepet ve sipariş adımlarında teknik
                aksaklıklar yaşanabileceğini hatırlatırız.
              </p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
