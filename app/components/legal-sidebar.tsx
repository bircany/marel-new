import Link from "next/link";

interface LegalSidebarProps {
  currentPath: string;
}

const LEGAL_LINKS = [
  { href: "/gizlilik-politikasi", label: "Gizlilik ve Güvenlik Politikası" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/iade-ve-iptal-kosullari", label: "İade ve İptal Koşulları" },
  { href: "/kvkk-aydinlatma-metni", label: "Kişisel Veriler Politikası (KVKK)" },
  { href: "/cerez-politikasi", label: "Çerez (Cookie) Politikası" },
  { href: "/iletisim", label: "İletişim & Danışma" },
];

export function LegalSidebar({ currentPath }: LegalSidebarProps) {
  return (
    <aside className="legal-sidebar-nav">
      <div className="legal-sidebar-header">
        <span>Yasal Bilgilendirme</span>
      </div>

      <nav className="legal-sidebar-links">
        {LEGAL_LINKS.map((link) => {
          const isActive = currentPath === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={isActive ? "active" : ""}
            >
              <span>{link.label}</span>
              {isActive && <span className="legal-active-dot" aria-hidden="true">•</span>}
            </Link>
          );
        })}
      </nav>

      <div className="legal-sidebar-contact">
        <strong>Sorunuz mu var?</strong>
        <p>Sipariş, sözleşme veya yasal haklarınız için danışmanımıza ulaşabilirsiniz.</p>
        <a
          href="https://wa.me/905467356602?text=Merhaba,%20yasal%20surecler%20ve%20siparis%20hakkinda%20bilgi%20almak%20istiyorum."
          target="_blank"
          rel="noreferrer"
          className="legal-whatsapp-btn"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 0 1-1.25-4.38c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.11 8.11 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.53.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.47-.29z" />
          </svg>
          <span>WhatsApp Danışma</span>
        </a>
      </div>
    </aside>
  );
}
