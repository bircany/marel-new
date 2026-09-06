'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cartStore';
import apiClient from '@/lib/axios';
import type { Product } from '@/types';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const summary = useCartStore((s) => s.summary);
    const fetchCart = useCartStore((s) => s.fetchCart);

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const debouncedQuery = useDebounce(query, 400);
    const isDebouncing = query.trim() !== debouncedQuery.trim();
    const searchRef = useRef<HTMLDivElement>(null);

    // Sepet sayacını yükle
    useEffect(() => { fetchCart(); }, [fetchCart]);

    // Arama debounce
    useEffect(() => {
        if (!debouncedQuery.trim()) return;
        apiClient.get('/products', { params: { search: debouncedQuery, per_page: 5 } })
            .then(r => setResults(r.data?.data ?? []))
            .catch(() => setResults([]));
    }, [debouncedQuery]);

    // Dışına tıklayınca kapat
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false); setQuery(''); setResults([]);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Route değişiminde menüyü kapat
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);

    const navigateSearch = () => {
        if (query.trim()) {
            router.push(`/products?search=${encodeURIComponent(query.trim())}`);
            setSearchOpen(false); setQuery(''); setResults([]);
        }
    };

    // Admin layoutunda gösterme
    if (pathname.startsWith('/admin')) return null;

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="text-lg font-bold text-white tracking-tight shrink-0">
                        <span className="text-indigo-400">Soft</span>Trade
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/products" className="text-sm text-slate-300 hover:text-white transition-colors">
                            Ürünler
                        </Link>
                        <Link href="/contact" className="text-sm text-slate-300 hover:text-white transition-colors">
                            Iletisim
                        </Link>
                    </div>

                    {/* Sağ: Arama + Sepet + Kullanıcı */}
                    <div className="flex items-center gap-2">

                        {/* Arama */}
                        <div ref={searchRef} className="relative">
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400
                           hover:text-white hover:bg-slate-800 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            {searchOpen && (
                                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-700
                               rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                                        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && navigateSearch()}
                                            placeholder="Ürün ara…"
                                            autoFocus
                                            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500
                                 outline-none"
                                        />
                                        {isDebouncing && (
                                            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent
                                      animate-spin shrink-0" />
                                        )}
                                    </div>

                                    {results.length > 0 && (
                                        <div className="max-h-64 overflow-y-auto">
                                            {results.map((p) => (
                                                <Link
                                                    key={p.id}
                                                    href={`/products/${p.slug}`}
                                                    onClick={() => { setSearchOpen(false); setQuery(''); }}
                                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                                                        {p.cover_image?.url && (
                                                            <Image
                                                                src={p.cover_image.url}
                                                                alt={p.name}
                                                                width={40}
                                                                height={40}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-white truncate">{p.name}</p>
                                                        <p className="text-xs text-indigo-400">{p.formatted_current_price}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                            <button onClick={navigateSearch}
                                                className="w-full px-4 py-2 text-xs text-indigo-400 hover:bg-slate-800 text-center">
                                                Tüm sonuçları gör →
                                            </button>
                                        </div>
                                    )}

                                    {query && !isDebouncing && results.length === 0 && (
                                        <p className="px-4 py-4 text-xs text-slate-500 text-center">Sonuç bulunamadı.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sepet */}
                        <Link
                            href="/cart"
                            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400
                         hover:text-white hover:bg-slate-800 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {summary.total_quantity > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600
                               text-white text-[10px] font-bold flex items-center justify-center">
                                    {summary.total_quantity > 9 ? '9+' : summary.total_quantity}
                                </span>
                            )}
                        </Link>

                        {/* Kullanıcı */}
                        {user ? (
                            <div className="hidden sm:flex items-center gap-4">
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                                        Admin Paneli
                                    </Link>
                                )}
                                <Link
                                    href="/account"
                                    className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300
                                  flex items-center justify-center text-xs font-bold">
                                        {user.first_name?.charAt(0)}
                                    </div>
                                    <span className="hidden lg:inline">{user.first_name}</span>
                                </Link>
                            </div>
                        ) : (
                            <Link href="/auth/login" className="hidden sm:block text-sm text-slate-300 hover:text-white
                                                   transition-colors">
                                Giriş Yap
                            </Link>
                        )}

                        {/* Hamburger (mobil) */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center
                         text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobil Menü */}
            {menuOpen && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-fade-in">
                    <div className="px-4 py-3 space-y-1">
                        <Link href="/" className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                            Ana Sayfa
                        </Link>
                        <Link href="/products" className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                            Ürünler
                        </Link>
                        <Link href="/contact" className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                            Iletisim
                        </Link>
                        <Link href="/cart" className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                            Sepetim {summary.total_quantity > 0 && `(${summary.total_quantity})`}
                        </Link>
                        <div className="border-t border-slate-800 my-2" />
                        {user ? (
                            <>
                                <Link href="/account" className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                                    Hesabım
                                </Link>
                                <button onClick={logout}
                                    className="block w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="block px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800">
                                    Giriş Yap
                                </Link>
                                <Link href="/auth/register" className="block px-3 py-2.5 rounded-xl text-sm text-indigo-400 hover:bg-slate-800">
                                    Kayıt Ol
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

