import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="shop-footer kamatas-footer">
      <div className="shop-container footer-shop-grid">
        <div className="footer-shop-brand">
          <Link href="/">
            <Image
              unoptimized
              src="/images/marel-logo.png"
              alt="Marel Perde ve Sineklik Sistemleri"
              width={200}
              height={40}
              style={{ objectFit: "contain", width: "auto", height: "38px" }}
            />
          </Link>
        </div>

        <div>
          <h3>Kategoriler</h3>
          <Link href="/sineklikler">Sineklikler</Link>
          <Link href="/perdeler">Perdeler</Link>
          <Link href="/tutamaklar">Tutamaklar</Link>
          <Link href="/profiller">Profiller</Link>
          <Link href="/kosebentler-1">Köşebentler</Link>
          <Link href="/aksesuarlar">Aksesuarlar</Link>
        </div>

        <div>
          <h3>Hesabım</h3>
          <Link href="/account/login">Giriş Yap</Link>
          <Link href="/account/register">Kayıt ol</Link>
        </div>

        <div>
          <h3>Hakkımızda</h3>
          <Link href="/pages/iletisim">İletişim</Link>
          <Link href="/pages/gizlilikguvenlikpolitikasi">Gizlilik Güvenlik Politikası</Link>
          <Link href="/pages/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
          <Link href="/pages/tuketici-haklari-cayma-iptal-iade-kosullari">Tüketici Hakları Cayma İptal İade Koşulları</Link>
          <Link href="/pages/kisisel-veriler-politikasi">Kişisel Veriler Politikası</Link>
          <h3 className="footer-video-title" style={{ marginTop: 20, fontWeight: 800, fontSize: "0.85rem", color: "#0f172a" }}>
            Kurulum ve Montaj Videoları için:
          </h3>
          <div className="footer-social-links" style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <a
              href="https://www.instagram.com/marelpliseperde"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                color: "#ffffff",
                padding: "0 !important",
                margin: 0,
                boxShadow: "0 3px 10px rgba(220, 39, 67, 0.3)",
                transition: "transform 0.2s ease",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ display: "block" }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@marelpliseperde"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#FF0000",
                color: "#ffffff",
                padding: "0 !important",
                margin: 0,
                boxShadow: "0 3px 10px rgba(255, 0, 0, 0.3)",
                transition: "transform 0.2s ease",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ display: "block" }}>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="shop-container footer-payment">
        <Image unoptimized src="/images/payment/visa.svg" alt="Visa" width={78} height={26} />
        <Image
          unoptimized
          className="payment-mastercard"
          src="/images/payment/mastercard.svg"
          alt="Mastercard"
          width={48}
          height={30}
        />
        <Image
          unoptimized
          className="payment-troy"
          src="/images/payment/troy.svg"
          alt="TROY"
          width={72}
          height={27}
        />
      </div>

      <div className="shop-container footer-copyright">
        © 2026 Marel Perde ve Mimari Sistemler. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
