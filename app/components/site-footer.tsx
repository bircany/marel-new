import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="iletisim">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/marel-logo.png" alt="Marel Plise Perde" width={410} height={62} />
          <p>Ölçüye özel perde, sineklik ve mimari geçiş sistemleri.</p>
          <a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">0546 735 66 02</a>
        </div>
        <div><h3>Ürünler</h3><Link href="/urunler#plise-perde">Plise perde</Link><Link href="/urunler#jaluzi-perde">Jaluzi perde</Link><Link href="/urunler#zip-perde">Zip perde</Link><Link href="/urunler#sineklik">Sineklik</Link></div>
        <div><h3>Yardım</h3><Link href="/urunler/plise-perde/diamond-serisi#teklif">Teklif al</Link><Link href="/#duyurular">Duyurular</Link><Link href="/#galeri">Galeri</Link><a href="https://wa.me/905467356602" target="_blank" rel="noreferrer">WhatsApp destek</a></div>
        <div className="footer-note"><span>Türkiye geneli</span><strong>Doğru ölçü.<br />Doğru sistem.<br />Net teklif.</strong></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 Marel. Tüm hakları saklıdır.</span><span>Ölçüye özel yaşam çözümleri.</span></div>
    </footer>
  );
}
