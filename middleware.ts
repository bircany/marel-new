import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin paneli ve API yolları bakım modundan etkilenmez
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/bakim' ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i)
  ) {
    return NextResponse.next();
  }

  try {
    // API'den settings bilgisini al (cache ile)
    const res = await fetch(new URL('/api/settings/public', request.url), {
      next: { revalidate: 30 } // 30 saniye cache'le
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.maintenance_mode === 'true' || data.maintenance_mode === true) {
        return NextResponse.rewrite(new URL('/bakim', request.url));
      }
    }
  } catch (err) {
    // API hatası olursa sessizce geç
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
