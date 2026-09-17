# Marel geliştirme notları

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi
- `npm run lint` — ESLint
- `npm run db:setup` — `db/setup-supabase.mjs` ile şema kurulumu
- `npm run db:generate` — `db/drizzle.config.ts` kullanarak migration üretimi

## Mimari kurallar

Public içerik sayfaları Pages Router (`pages/`) üzerinden üretilir; `_app.tsx`
ve `404.tsx` bu dizindedir. Admin, API ve DB'ye sıkı bağlı ürün rotaları App
Router (`app/`) üzerinde çalışır. Aynı URL için iki router route'u oluşturmayın.

Next/Vercel yapılandırmaları (`package.json`, `tsconfig.json`, `next.config.ts`,
`postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `vercel.json`) kökte
kalmalıdır. Drizzle yapılandırması `db/drizzle.config.ts` içindedir.

API, `app/api.ts` içindeki merkezi metotlar ve `pages/api/[...path].ts` adaptörü üzerinden işlev modüllerine
dağıtılır; yeni endpoint eklerken Vercel function sayısını artırmamaya dikkat
edin. Gizli değerleri yalnızca `.env.local` içinde tutun.

`public/images/products` canlı katalog serileri için ayrılmıştır; silme öncesi
`db/generated-catalog.ts` ve uygulama referansları kontrol edilmelidir. Yerel
bağımlılıklar ve `*.tsbuildinfo` Git dışında tutulur.

