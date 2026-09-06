import Link from 'next/link';

type FooterData = {
    footer?: {
        company_name?: string;
        footer_text?: string;
        copyright?: string;
    };
    contact?: {
        phone?: string;
        email?: string;
    };
    pages?: Record<string, boolean>;
};

async function getSettings(): Promise<FooterData> {
    const base = process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
    if (!base) return {};

    try {
        const res = await fetch(`${base}/settings/public`, { cache: 'no-store' });
        if (!res.ok) return {};
        const json = await res.json();
        return json?.data ?? {};
    } catch {
        return {};
    }
}

export default async function SiteFooter() {
    const settings = await getSettings();
    const footer = settings.footer ?? {};
    const contact = settings.contact ?? {};

    return (
        <footer className="mt-12 border-t border-slate-800 bg-slate-950/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-3 gap-6 text-sm">
                <div>
                    <p className="text-white font-semibold">{footer.company_name ?? 'SoftTrade'}</p>
                    <p className="text-slate-400 mt-2">{footer.footer_text ?? 'Guvenli alisveris deneyimi.'}</p>
                </div>
                <div>
                    <p className="text-white font-semibold">Hizli Linkler</p>
                    <div className="mt-2 space-y-1">
                        <Link className="block text-slate-400 hover:text-white" href="/products">Urunler</Link>
                        <Link className="block text-slate-400 hover:text-white" href="/cart">Sepet</Link>
                        {(settings.pages?.contact ?? true) && <Link className="block text-slate-400 hover:text-white" href="/contact">Iletisim</Link>}
                    </div>
                </div>
                <div>
                    <p className="text-white font-semibold">Iletisim</p>
                    <p className="text-slate-400 mt-2">Telefon: {contact.phone ?? '-'}</p>
                    <p className="text-slate-400">E-posta: {contact.email ?? '-'}</p>
                </div>
            </div>
            <div className="border-t border-slate-800 py-3 text-center text-xs text-slate-500">
                {footer.copyright ?? 'SoftTrade'}
            </div>
        </footer>
    );
}
