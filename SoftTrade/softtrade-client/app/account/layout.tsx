'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
    { href: '/account', label: 'Profilim', icon: 'P' },
    { href: '/account/orders', label: 'Siparislerim', icon: 'S' },
    { href: '/account/addresses', label: 'Adreslerim', icon: 'A' },
    { href: '/account/reviews', label: 'Yorumlarim', icon: 'Y' },
    { href: '/account/coupons', label: 'Kuponlarim', icon: 'C' },
    { href: '/account/password', label: 'Sifre Degistir', icon: 'K' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-900">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid rgba(51,65,85,0.5)',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-64 shrink-0">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 lg:sticky lg:top-6">
                            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-700/50">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-lg font-bold">
                                    {user?.first_name?.charAt(0).toUpperCase() ?? '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {NAV_ITEMS.map((item) => {
                                    const active = item.href === '/account'
                                        ? pathname === '/account'
                                        : pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                                active
                                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                        >
                                            <span className="w-5 text-center">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all w-full mt-4"
                            >
                                <span className="w-5 text-center">X</span>
                                Cikis Yap
                            </button>
                        </div>
                    </aside>

                    <main className="flex-1 min-w-0">{children}</main>
                </div>
            </div>
        </div>
    );
}

