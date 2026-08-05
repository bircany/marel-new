import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-track" aria-label="Hizmet duyuruları">
          <span>Ölçünüze özel üretim</span><i />
          <span>WhatsApp&apos;tan hızlı teklif</span><i />
          <span>Kumaş ve profil danışmanlığı</span>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="Marel ana sayfa">
            <Image src="/images/marel-logo.png" alt="Marel Plise Perde" width={410} height={62} priority />
          </Link>
          <nav className="desktop-nav" aria-label="Ana navigasyon">
            <Link href="/urunler">Ürünler</Link>
            <Link href="/#koleksiyonlar">Koleksiyonlar</Link>
            <Link href="/#duyurular">Duyurular</Link>
            <Link href="/#galeri">Galeri</Link>
            <Link href="/#iletisim">İletişim</Link>
          </nav>
          <div className="header-actions">
            <Link className="search-link" href="/urunler" aria-label="Ürünlerde ara">⌕</Link>
            <Link className="header-cta" href="/urunler/plise-perde/diamond-serisi#teklif">Teklif al</Link>
            <details className="mobile-menu">
              <summary aria-label="Menüyü aç"><span /><span /></summary>
              <nav aria-label="Mobil navigasyon">
                <Link href="/urunler">Ürünler</Link>
                <Link href="/#koleksiyonlar">Koleksiyonlar</Link>
                <Link href="/#duyurular">Duyurular</Link>
                <Link href="/#galeri">Galeri</Link>
                <Link href="/#iletisim">İletişim</Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
