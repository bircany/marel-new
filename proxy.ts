import { NextRequest, NextResponse } from "next/server";
import {
  applyCorsHeaders,
  checkRateLimitAsync,
  clientKey,
  corsPreflightResponse,
  limitForPath,
  rateLimitHeaders,
  resolveCorsOrigin,
} from "@/app/lib/security";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/|robots.txt|sitemap.xml).*)"],
};

/** Security headers added to all responses */
function addSecurityHeaders(res: NextResponse, isApi: boolean): NextResponse {
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  if (!isApi) {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.headers.set("Content-Security-Policy",
      ["default-src 'self'",
       "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
       "font-src 'self' https://fonts.gstatic.com",
       "img-src 'self' data: https: blob:",
       "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://va.vercel-scripts.com wss:",
       "frame-src 'self' https://www.google.com",
       "object-src 'none'",
       "base-uri 'self'",
       "form-action 'self'"].join("; "));
  }
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // CORS preflight for API routes
  if (request.method === "OPTIONS" && isApi) {
    return corsPreflightResponse(request);
  }

  // CORS origin check for API routes
  if (isApi) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin && !resolveCorsOrigin(origin)) {
      return NextResponse.json({ error: "CORS: origin izinli değil." }, { status: 403 });
    }
  }

  // Rate limiting for API routes
  if (isApi) {
    const { limit, windowMs } = limitForPath(pathname);
    const bucketKey = `${clientKey(request)}:${pathname}:${request.method}`;
    const rl = await checkRateLimitAsync(bucketKey, limit, windowMs);

    if (!rl.allowed) {
      const headers = new Headers({
        "content-type": "application/json",
        ...rateLimitHeaders(rl),
      });
      applyCorsHeaders(headers, request);
      return new NextResponse(JSON.stringify({ error: "Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin." }), {
        status: 429,
        headers,
      });
    }

    const response = NextResponse.next();
    for (const [key, value] of Object.entries(rateLimitHeaders(rl))) {
      response.headers.set(key, value);
    }
    applyCorsHeaders(response.headers, request);
    return addSecurityHeaders(response, true);
  }

  // Non-API routes: just add security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response, false);
}
