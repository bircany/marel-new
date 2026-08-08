import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="shop-footer">
      <div className="shop-container footer-shop-grid">
        <div className="footer-shop-brand">
          <Image unoptimized src="/images/marel-logo.png" alt="Marel" width={410} height={62} />
          <p>Ölçüye özel perde, sineklik ve yaşam alanı sistemleri.</p>
          <a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">WhatsApp: 0546 735 66 02</a>
        </div>
        <div><h3>Kategoriler</h3><Link href="/urunler/plise-perde">Plise Perde</Link><Link href="/urunler/jaluzi-perde">Jaluzi Perde</Link><Link href="/urunler/zip-perde">Zip Perde</Link><Link href="/urunler/sineklik">Sineklik</Link><Link href="/urunler/surgulu-kapilar">Sürgülü Kapılar</Link></div>
        <div><h3>Hesabım</h3><Link href="/hesabim">Hesabım</Link><Link href="/sepet">Sepetim</Link><Link href="/siparis-takip">Sipariş Takip</Link><Link href="/urunler">Ürünler</Link></div>
        <div><h3>Kurumsal</h3><Link href="/duyurular">Duyurular</Link><Link href="/#galeri">Kategoriler</Link><Link href="/iletisim">İletişim</Link><Link href="/gizlilik-ve-iade-kosullari">Gizlilik ve İade Koşulları</Link></div>
      </div>
      <div className="shop-container footer-payment">
        <span>Güvenli ödeme</span>
        <Image unoptimized src="/images/payment/visa.svg" alt="Visa" width={78} height={26} />
        <Image unoptimized className="payment-mastercard" src="/images/payment/mastercard.svg" alt="Mastercard" width={48} height={30} />
        <Image unoptimized className="payment-troy" src="/images/payment/troy.svg" alt="TROY" width={72} height={27} />
        <span className="payment-security">256-bit SSL koruması</span>
      </div>
      <div className="shop-container footer-copyright">© 2026 Marel. Tüm hakları saklıdır.</div>
    </footer>
  );
}
