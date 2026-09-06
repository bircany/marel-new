'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/orders', label: 'Siparişler', icon: '📦' },
    { href: '/admin/products', label: 'Ürünler', icon: '🏷️' },
    { href: '/admin/categories', label: 'Kategoriler', icon: '📂' },
    { href: '/admin/coupons', label: 'Kuponlar', icon: '🎟️' },
    { href: '/admin/settings', label: 'Site Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, fetchMe, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [checked, setChecked] = useState(false);

    // Admin rol kontrolü
    useEffect(() => {
        async function check() {
            if (!user) await fetchMe();
            setChecked(true);
        }
        check();
    }, [user, fetchMe]);

    useEffect(() => {
        if (checked && isAuthenticated && !isAdmin) {
            router.replace('/');
        }
    }, [checked, isAuthenticated, isAdmin, router]);

    // Henüz kontrol tamamlanmadıysa loading göster
    if (!checked || !isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <Toaster position="top-right" toastOptions={{
                style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(51,65,85,.5)', borderRadius: '12px', fontSize: '14px' },
                success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
            }} />

            {/* ── Overlay (mobil) ────────────────────────────── */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ────────────────────────────────────── */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-slate-900 border-r border-slate-800
                          flex flex-col transition-transform duration-300
                          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Marka */}
                <div className="h-14 flex items-center px-5 border-b border-slate-800 shrink-0">
                    <Link href="/admin" className="text-lg font-bold text-white tracking-tight">
                        <span className="text-indigo-400">Soft</span>Trade
                    </Link>
                    <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full
                           border border-indigo-500/30 font-medium">Admin</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {NAV.map((item) => {
                        const active = item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${active
                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Alt */}
                <div className="p-3 border-t border-slate-800 space-y-1">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500
                                     hover:text-slate-300 hover:bg-slate-800 transition-all">
                        <span>🌐</span> Siteye Git
                    </Link>
                    <button onClick={logout}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400/60
                       hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
                        <span>🚪</span> Çıkış
                    </button>
                </div>
            </aside>

            {/* ── Ana İçerik ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800
                           flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300
                            flex items-center justify-center text-xs font-bold">
                            {user?.first_name?.charAt(0) ?? 'A'}
                        </div>
                        <span className="text-sm text-slate-300 hidden sm:block">
                            {user?.first_name} {user?.last_name}
                        </span>
                    </div>
                </header>

                {/* İçerik */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

