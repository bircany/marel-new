'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/axios';

type SitePageRow = { key: string; title: string; is_active: boolean };

type SettingsPayload = {
    homepage: Record<string, unknown>;
    footer: Record<string, unknown>;
    contact: Record<string, unknown>;
    pages: SitePageRow[];
};

export default function AdminSettingsPage() {
    const [data, setData] = useState<SettingsPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            apiClient.get('/admin/settings')
                .then((res) => setData(res.data?.data ?? null))
                .catch(() => toast.error('Ayarlar yuklenemedi.'))
                .finally(() => setLoading(false));
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const homepage = useMemo(() => (data?.homepage ?? {}) as Record<string, string | boolean>, [data]);
    const footer = useMemo(() => (data?.footer ?? {}) as Record<string, string>, [data]);
    const contact = useMemo(() => (data?.contact ?? {}) as Record<string, string>, [data]);

    const setSectionField = (section: 'homepage' | 'footer' | 'contact', key: string, value: string | boolean) => {
        if (!data) return;
        setData({
            ...data,
            [section]: {
                ...(data[section] as Record<string, unknown>),
                [key]: value,
            },
        });
    };

    const saveSection = async (section: 'homepage' | 'footer' | 'contact') => {
        if (!data) return;
        setSaving(section);
        try {
            await apiClient.put(`/admin/settings/${section}`, { value: data[section] });
            toast.success('Kaydedildi.');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Kaydetme hatasi.';
            toast.error(msg);
        } finally {
            setSaving(null);
        }
    };

    const savePages = async () => {
        if (!data) return;
        setSaving('pages');
        try {
            await apiClient.put('/admin/settings/pages', { pages: data.pages });
            toast.success('Sayfa durumlari kaydedildi.');
        } catch {
            toast.error('Sayfa durumlari kaydedilemedi.');
        } finally {
            setSaving(null);
        }
    };

    const togglePage = (key: string) => {
        if (!data) return;
        setData({
            ...data,
            pages: data.pages.map((p) => (p.key === key ? { ...p, is_active: !p.is_active } : p)),
        });
    };

    if (loading) return <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />;
    if (!data) return <p className="text-slate-500">Ayarlar yuklenemedi.</p>;

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-xl font-bold text-white">Site Settings</h1>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-white font-semibold">Anasayfa</h2>
                <input value={(homepage.hero_title as string) ?? ''} onChange={(e) => setSectionField('homepage', 'hero_title', e.target.value)} className="input" placeholder="Hero Baslik" />
                <textarea value={(homepage.hero_subtitle as string) ?? ''} onChange={(e) => setSectionField('homepage', 'hero_subtitle', e.target.value)} className="input min-h-20" placeholder="Hero Alt Baslik" />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={Boolean(homepage.show_advantages)} onChange={(e) => setSectionField('homepage', 'show_advantages', e.target.checked)} className="accent-indigo-500" />
                    Avantajlar bandini goster
                </label>
                <button onClick={() => saveSection('homepage')} disabled={saving === 'homepage'} className="btn-primary text-sm">Kaydet</button>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-white font-semibold">Footer</h2>
                <input value={footer.company_name ?? ''} onChange={(e) => setSectionField('footer', 'company_name', e.target.value)} className="input" placeholder="Sirket Adi" />
                <input value={footer.footer_text ?? ''} onChange={(e) => setSectionField('footer', 'footer_text', e.target.value)} className="input" placeholder="Kisa yazi" />
                <input value={footer.copyright ?? ''} onChange={(e) => setSectionField('footer', 'copyright', e.target.value)} className="input" placeholder="Telif metni" />
                <button onClick={() => saveSection('footer')} disabled={saving === 'footer'} className="btn-primary text-sm">Kaydet</button>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-white font-semibold">Iletisim</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={contact.phone ?? ''} onChange={(e) => setSectionField('contact', 'phone', e.target.value)} className="input" placeholder="Telefon" />
                    <input value={contact.email ?? ''} onChange={(e) => setSectionField('contact', 'email', e.target.value)} className="input" placeholder="E-posta" />
                </div>
                <input value={contact.address ?? ''} onChange={(e) => setSectionField('contact', 'address', e.target.value)} className="input" placeholder="Adres" />
                <textarea value={contact.map_embed_url ?? ''} onChange={(e) => setSectionField('contact', 'map_embed_url', e.target.value)} className="input min-h-20" placeholder="Google Maps embed link" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={contact.instagram ?? ''} onChange={(e) => setSectionField('contact', 'instagram', e.target.value)} className="input" placeholder="Instagram" />
                    <input value={contact.facebook ?? ''} onChange={(e) => setSectionField('contact', 'facebook', e.target.value)} className="input" placeholder="Facebook" />
                    <input value={contact.x ?? ''} onChange={(e) => setSectionField('contact', 'x', e.target.value)} className="input" placeholder="X" />
                    <input value={contact.youtube ?? ''} onChange={(e) => setSectionField('contact', 'youtube', e.target.value)} className="input" placeholder="YouTube" />
                </div>
                <button onClick={() => saveSection('contact')} disabled={saving === 'contact'} className="btn-primary text-sm">Kaydet</button>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-white font-semibold">Sayfa Aktif/Pasif</h2>
                <div className="space-y-2">
                    {data.pages.map((p) => (
                        <label key={p.key} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2">
                            <span className="text-sm text-slate-300">{p.title}</span>
                            <input type="checkbox" checked={p.is_active} onChange={() => togglePage(p.key)} className="accent-indigo-500" />
                        </label>
                    ))}
                </div>
                <button onClick={savePages} disabled={saving === 'pages'} className="btn-primary text-sm">Durumlari Kaydet</button>
            </section>
        </div>
    );
}
