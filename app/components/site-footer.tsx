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
          <Link href="/urunler?kategori=Plise Perde">Plise Perde Sistemleri</Link>
          <Link href="/urunler?kategori=Jaluzi Perde">Jaluzi Perde Modelleri</Link>
          <Link href="/urunler?kategori=Zip Perde">Dış Mekân Zip Perde</Link>
          <Link href="/urunler?kategori=Sineklik">Pencere & Kapı Sineklik</Link>
          <Link href="/urunler?kategori=Sürgülü Kapılar">Sürgülü Kapı Sistemleri</Link>
          <Link href="/urunler">Tüm Ürünler & Fiyatlar</Link>
        </div>

        <div>
          <h3>Müşteri Hizmetleri</h3>
          <Link href="/siparis-takip">Sipariş & Kargo Takip</Link>
          <Link href="/sepet">Alışveriş Sepetim</Link>
          <Link href="/hesabim">Kullanıcı Hesabım</Link>
          <Link href="/iletisim">İletişim & Danışma</Link>
        </div>

        <div>
          <h3>Kurumsal & Yasal</h3>
          <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
          <Link href="/iade-ve-iptal-kosullari">İade ve İptal Koşulları</Link>
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
          <Link href="/cerez-politikasi">Çerez (Cookie) Politikası</Link>
          <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
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
        <span className="payment-security">🔒 256-Bit SSL Şifreli Güvenlik</span>
      </div>

      <div className="shop-container footer-copyright">
        © 2026 Marel Perde ve Mimari Sistemler. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
