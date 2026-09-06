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
  matcher: ["/api/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    return corsPreflightResponse(request);
  }

  const origin = request.headers.get("origin");
  if (origin && !resolveCorsOrigin(origin)) {
    return NextResponse.json({ error: "CORS: origin izinli değil." }, { status: 403 });
  }

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
  return response;
}
