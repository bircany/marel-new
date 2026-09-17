# Marel geliştirme notları

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi
- `npm run lint` — ESLint
- `npm run db:setup` — `db/setup-supabase.mjs` ile şema kurulumu
- `npm run db:generate` — `db/drizzle.config.ts` kullanarak migration üretimi

## Mimari kurallar

Bu proje Next.js App Router kullanır. `app/**/page.tsx`, `app/layout.tsx` ve
`app/not-found.tsx` Next tarafından route giriş noktası olarak aranır; bunları
top-level `pages/` klasörüne taşımayın. Sayfa gövdeleri gerektiğinde
`app/pages/` altında ayrıştırılabilir.

Next/Vercel yapılandırmaları (`package.json`, `tsconfig.json`, `next.config.ts`,
`postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `vercel.json`) kökte
kalmalıdır. Drizzle yapılandırması `db/drizzle.config.ts` içindedir.

API, `app/api/[...path]/route.ts` catch-all route üzerinden işlev modüllerine
dağıtılır; yeni endpoint eklerken Vercel function sayısını artırmamaya dikkat
edin. Gizli değerleri yalnızca `.env.local` içinde tutun.

`public/images/products` canlı katalog serileri için ayrılmıştır; silme öncesi
`db/generated-catalog.ts` ve uygulama referansları kontrol edilmelidir. Test
yardımcıları `tests/` altında, yerel bağımlılıklar ve `*.tsbuildinfo` ise Git
dışında tutulur.
