import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE ?? 'st_token';

// ── Rol gerektiren sayfalar ────────────────────────────────────────────────────
const PROTECTED_PATHS = ['/account', '/checkout', '/orders'];
const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS = ['/auth/login', '/auth/register'];

/**
 * Next.js Proxy (eski adıyla middleware).
 *
 * Sanctum token'ları opaque string'dir (JWT değil), bu yüzden
 * burada sadece token VARLIĞINI kontrol ediyoruz.
 * Admin rol kontrolü client-side'da (admin layout) fetchMe() ile yapılır.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const isAuthenticated = !!token && token !== 'undefined' && token !== 'null';

    // ── Giriş yapmış kullanıcı /auth/* sayfalarına giremez ───────────────────
    if (isAuthenticated && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/account', request.url));
    }

    // ── Admin sayfaları: token yoksa login'e yönlendir ────────────────────────
    // (Admin rol kontrolü client-side'da admin layout'unda yapılır)
    if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // ── Korumalı sayfalar ─────────────────────────────────────────────────────
    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
