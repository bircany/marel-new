import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://softtrade.com';
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/account/', '/checkout', '/cart', '/auth/'],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
    };
}
