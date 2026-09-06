import Link from 'next/link';

type PublicSettingsData = {
    contact?: {
        phone?: string;
        email?: string;
        address?: string;
        map_embed_url?: string;
        instagram?: string;
        facebook?: string;
        x?: string;
        youtube?: string;
    };
    pages?: Record<string, boolean>;
};

async function getSettings(): Promise<PublicSettingsData> {
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

export default async function ContactPage() {
    const data = await getSettings();
    const contact = data.contact ?? {};
    const isActive = data.pages?.contact ?? true;

    if (!isActive) {
        return (
            <main className="min-h-screen bg-slate-900 px-4 py-16">
                <div className="max-w-3xl mx-auto rounded-2xl border border-slate-700 bg-slate-800/40 p-8 text-center">
                    <h1 className="text-2xl font-bold text-white">Iletisim Sayfasi Kapali</h1>
                    <p className="text-slate-400 mt-2">Bu sayfa su an aktif degil.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-900 px-4 py-10">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                <section className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6">
                    <h1 className="text-2xl font-bold text-white">Iletisim</h1>
                    <p className="text-slate-400 mt-2">Bize ulasmak icin asagidaki kanallari kullanabilirsiniz.</p>

                    <div className="mt-6 space-y-3 text-sm text-slate-200">
                        <p><span className="text-slate-400">Telefon:</span> {contact.phone || '-'}</p>
                        <p><span className="text-slate-400">E-posta:</span> {contact.email || '-'}</p>
                        <p><span className="text-slate-400">Adres:</span> {contact.address || '-'}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {contact.instagram && <Link href={contact.instagram} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200">Instagram</Link>}
                        {contact.facebook && <Link href={contact.facebook} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200">Facebook</Link>}
                        {contact.x && <Link href={contact.x} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200">X</Link>}
                        {contact.youtube && <Link href={contact.youtube} className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-200">YouTube</Link>}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700 bg-slate-800/40 p-2 min-h-[360px] overflow-hidden">
                    {contact.map_embed_url ? (
                        <iframe
                            src={contact.map_embed_url}
                            width="100%"
                            height="100%"
                            className="w-full min-h-[340px] rounded-xl"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    ) : (
                        <div className="h-full min-h-[340px] grid place-items-center text-slate-500 text-sm">
                            Harita bilgisi henuz girilmedi.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
