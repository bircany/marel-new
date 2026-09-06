import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://softtrade.com';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

async function fetchSlugs(path: string): Promise<string[]> {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return (json.data ?? []).map((item: { slug: string }) => item.slug);
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [productSlugs, categorySlugs] = await Promise.all([
        fetchSlugs('/products?per_page=500'),
        fetchSlugs('/categories'),
    ]);

    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${BASE}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
        url: `${BASE}/products/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
        url: `${BASE}/products?category=${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
}
