import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="shop-footer">
      <div className="shop-container footer-shop-grid">
        <div className="footer-shop-brand">
          <Link href="/">
            <Image
              unoptimized
              src="/images/marel-logo.png"
              alt="Marel Perde ve Sineklik Sistemleri"
              width={240}
              height={48}
              style={{ objectFit: "contain", width: "auto", height: "46px" }}
            />
          </Link>
          <p>Ölçüye özel plise perde, jaluzi, zip perde, sineklik ve sürme kapı sistemleri üreticisi.</p>
          <a
            href="https://wa.me/905467356602"
            target="_blank"
            rel="noreferrer"
            className="footer-whatsapp-link"
          >
            <span style={{ color: "#22c55e" }}>●</span> Canlı WhatsApp Destek: 0546 735 66 02
          </a>
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
          <Link href="/siparis-takip">Yurtiçi Kargo Sipariş Takip</Link>
          <Link href="/sepet">Sepetim</Link>
        </div>

        <div>
          <h3>Hakkımızda</h3>
          <Link href="/pages/iletisim">İletişim</Link>
          <Link href="/pages/gizlilikguvenlikpolitikasi">Gizlilik Güvenlik Politikası</Link>
          <Link href="/pages/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
          <Link href="/pages/tuketici-haklari-cayma-iptal-iade-kosullari">Tüketici Hakları Cayma İptal İade Koşulları</Link>
          <Link href="/pages/kisisel-veriler-politikasi">Kişisel Veriler Politikası</Link>
          <h3 className="footer-video-title">Kurulum ve Montaj Videoları için:</h3>
          <a href="https://www.youtube.com/@KamatasAluminyum" target="_blank" rel="noreferrer">YouTube</a>
        </div>
      </div>

      <div className="shop-container footer-payment">
        <span>Güvenli Alışveriş & Ödeme:</span>
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
        <span className="payment-security">256-Bit SSL Şifreli Güvenlik</span>
      </div>

      <div className="shop-container footer-copyright">
        © 2026 Marel Perde ve Mimari Sistemler. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
