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
        <div><h3>Kategoriler</h3><Link href="/urunler#plise-perde">Plise Perde</Link><Link href="/urunler#jaluzi-perde">Jaluzi Perde</Link><Link href="/urunler#zip-perde">Zip Perde</Link><Link href="/urunler#sineklik">Sineklik</Link></div>
        <div><h3>Hesabım</h3><Link href="/hesabim">Hesabım</Link><Link href="/sepet">Sepetim</Link><Link href="/siparis-takip">Sipariş Takip</Link><Link href="/urunler">Ürünler</Link></div>
        <div><h3>Kurumsal</h3><Link href="/duyurular">Duyurular</Link><Link href="/#galeri">Fotoğraf Galerisi</Link><Link href="/iletisim">İletişim</Link><Link href="/gizlilik-ve-iade-kosullari">Gizlilik ve İade Koşulları</Link></div>
      </div>
      <div className="shop-container footer-payment"><span>Güvenli ödeme</span><b>VISA</b><b>mastercard.</b><b>TROY</b><span>256-bit SSL koruması</span></div>
      <div className="shop-container footer-copyright">© 2026 Marel. Tüm hakları saklıdır.</div>
    </footer>
  );
}
