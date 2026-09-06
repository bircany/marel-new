# Marel v2

Marel'in plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı ürünleri için hazırlanan tam özellikli e-ticaret uygulaması.  
Stack: **Next.js 16** · **Cloudflare Workers** · **Cloudflare D1 (SQLite)** · **Cloudflare R2** · **Laravel Backend (`backend/`)**

Ürün / sipariş / auth Laravel API (`backend`, eski SoftTrade) üzerinden gider. API erişilemezse ürün listesi D1'e düşer; **giriş, admin ve sipariş akışı çalışmaz**.

---

## 🚀 Projeyi Yerel Ortamda Çalıştırma

### Gereksinimler

- Node.js `>= 22.13.0` + npm
- PHP `>= 8.2` + Composer (Laravel backend için)
- Backend API — varsayılan: `http://localhost:8081/api/v1`

> Klasör: kökte `backend` (junction) → içerik `SoftTrade/`. OneDrive kilidi kalkınca fiziksel adı `backend` yapabilirsiniz. SoftTrade'in kendi Next istemcisi (`softtrade-client`) **Marel için kullanılmaz**.

### Kurulum

```bash
# 1. Storefront bağımlılıkları
npm install

# 2. Storefront ortam değişkenleri
cp .env.example .env.local

# 3. Backend (Laravel API) — Docker ile önerilen yol
npm run backend:up
# API: http://localhost:8081/api/v1

# Alternatif (yerel PHP):
# cd backend && composer install && php artisan key:generate && php artisan migrate --seed && php artisan serve --port=8081

# 4. Başka terminalde storefront
npm run dev
```

Kök Docker kısayolları:

```bash
npm run backend:up      # db + API (build + migrate + seed)
npm run backend:logs    # API logları
npm run backend:ps      # konteyner durumu
npm run backend:down    # durdur
```
Uygulama varsayılan olarak **http://localhost:3000** adresinde çalışır.  
Port doluysa vinext sıradaki porta geçer (`3001`, `3002`, …). Terminaldeki Local URL'ye bak.

> **Windows / OneDrive notu:** Proje OneDrive altında ise `npm install` / klasör yeniden adlandırma sırasında `EBUSY` veya Access Denied alınabilir.

---

## 🔑 Ortam Değişkenleri

`.env.example` dosyasını kopyalayarak `.env.local` oluştur ve aşağıdaki değerleri doldur:

| Değişken | Açıklama | Örnek Değer |
|---|---|---|
| `MAREL_ADMIN_EMAILS` | Eski / yedek env alanı (virgülle ayrılmış e-postalar). **Asıl admin kontrolü SoftTrade `role === "admin"` ile yapılır.** | `admin@example.com` |
| `SOFTRADE_API_URL` | Laravel backend API (`backend/`) | `http://localhost:8081/api/v1` |
| `SOFTRADE_ADMIN_EMAIL` | Backend admin e-posta (servis token + panel) | `admin@softtrade.com` |
| `SOFTRADE_ADMIN_PASSWORD` | Backend admin şifre | `admin123` |
| `CORS_ALLOWED_ORIGINS` | API CORS için izinli origin listesi (virgülle) | `http://localhost:3000,http://localhost:3006` |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads dönüşüm ID'si (opsiyonel) | `AW-000000000` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Google Ads dönüşüm etiketi (opsiyonel) | `replace-with-conversion-label` |

> **Not:** `.env*` dosyaları `.gitignore` ile repo dışında tutulmaktadır. Asla commit etme.

---

## 🎛️ Paneller ve Giriş

### 1. Admin paneli — `/admin`

SoftTrade'de **`role = "admin"`** olan hesap gerekir.

| Sekme | Ne yapar |
|---|---|
| **Ürünler** | Ekleme, fiyat / stok, görsel yükleme, yayında / öne çıkan |
| **Siparişler** | Durum güncelleme (bekliyor → işlemde → kargoda → teslim…) |
| **Yorumlar** | Onay / red + Marel yanıtı |
| **Duyurular** | Kampanya / rehber içerik CRUD |
| **Mesajlar** | İletişim formu (yeni / okundu / sonuçlandı) |

#### Varsayılan admin bilgileri (SoftTrade local)

> ⚠️ Yalnızca **yerel geliştirme** içindir. Production'da mutlaka değiştir!

| Alan | Değer |
|---|---|
| **E-posta** | `admin@softtrade.com` |
| **Şifre** | `admin123` |
| **Rol** | `admin` |
| **Giriş URL** | `http://localhost:3000/admin` |

#### Admin giriş adımları

1. `/admin` adresine git
2. "Yönetici girişi" formunda e-posta ve şifre gir
3. SoftTrade `role === "admin"` ise konsol açılır; değilse login formu kalır

#### Admin kimlik doğrulama akışı

```
Kullanıcı /admin'e gider
    ↓
getAdminUser() çağrılır
    ↓
marel_token cookie'si okunur
    ↓
SoftTrade API /auth/me endpoint'i çağrılır
    ↓
user.role === "admin" ise → Admin Console gösterilir
    ↓
Değilse → Login formu gösterilir
```

### 2. Müşteri paneli — `/hesabim`

Kayıt veya giriş sonrası: siparişler, yorumlar, sipariş takip linki, WhatsApp destek.

| Alan | Açıklama |
|---|---|
| Giriş | E-posta + şifre |
| Kayıt | Ad, soyad, e-posta, telefon (opsiyonel), şifre (min. 8 karakter) |
| Form | `AuthPanel` — Hesabım, Sepet veya Admin giriş kapısında |

### 3. Mağaza sayfaları

| URL | İçerik |
|---|---|
| `/` | Ana sayfa — ürün grupları, koleksiyonlar, duyurular |
| `/urunler` | Ürün kataloğu |
| `/urunler/[slug]` | Ürün detay |
| `/sepet` | Sepet (+ ödeme öncesi giriş) |
| `/siparis-takip` | Sipariş takip |
| `/iletisim` | İletişim formu |
| `/duyurular` | Duyurular |
| `/gizlilik-ve-iade-kosullari` | Yasal metin |
| `/admin` | Yönetim paneli (admin girişi gerekli) |
| `/hesabim` | Müşteri hesap paneli |

### Oturum cookie'leri

| Cookie | Açıklama |
|---|---|
| `marel_token` | SoftTrade JWT Bearer token |
| `marel_session` | Anonim sepet oturum ID'si |

### SoftTrade olmadan ne çalışır?

| Özellik | SoftTrade kapalıyken |
|---|---|
| Mağaza vitrini / ürün listesi | Kısmen (D1 fallback) |
| Giriş / kayıt | ❌ |
| Admin paneli | ❌ |
| Sepetten sipariş | ❌ |

Bu makinede Laravel backend `http://localhost:8081/api/v1` üzerinde çalışıyor olmalıdır (`npm run backend:serve`).

---

## 🗄️ Veritabanı & Altyapı

### Cloudflare D1 (SQLite) — Ana Veritabanı

| Özellik | Değer |
|---|---|
| Binding adı (Worker) | `DB` |
| Database adı | `marel-commerce` |
| ORM | Drizzle ORM |
| Schema dosyası | `db/schema.ts` |
| DB yardımcı fonksiyonlar | `db/index.ts` |
| Migration klasörü | `./drizzle/` |

**Tablolar:**
- `users` — Kullanıcı hesapları
- `products` — Ürün kataloğu
- `product_images` — Ürün görselleri
- `cart_items` — Sepet kalemleri
- `orders` — Siparişler
- `order_items` — Sipariş kalemleri
- `order_events` — Sipariş durum geçmişi
- `reviews` — Ürün değerlendirmeleri
- `announcements` — Duyurular / blog yazıları
- `contact_messages` — İletişim mesajları

**Migration oluşturma:**
```bash
npm run db:generate
```

> D1 veritabanı ilk istekte otomatik olarak oluşturulur (`ensureDatabase()` ile). Manuel migration gerekmez.

---

### Cloudflare R2 — Ürün Görselleri Depolama

| Özellik | Değer |
|---|---|
| Binding adı (Worker) | `PRODUCT_IMAGES` |
| Bucket adı | `marel-product-images` |

---

### SoftTrade / Laravel Backend (`backend/`)

Ürünler, siparişler, yorumlar ve kullanıcı auth işlemleri Laravel API üzerinden yönetilir.  
Klasör: `backend/` (junction) veya `SoftTrade/` — aynı içerik. Detay: `backend/README.md`.

D1 fallback yalnızca ürün okuma için kullanılır (API erişilemez durumdaysa).

| Özellik | Değer |
|---|---|
| Bu repoda mı? | **Evet** — `backend/` (Laravel) |
| SoftTrade Next istemcisi | `backend/softtrade-client` — **Marel kullanmaz** |
| API Base URL | `SOFTRADE_API_URL` → `http://localhost:8081/api/v1` |
| Auth yöntemi | Bearer Token (JWT / Sanctum) |
| Admin | `admin@softtrade.com` / `admin123` · `role=admin` |
| Katalog seed | `MarelCatalogSeeder` (marka: Marel) |
| Admin token yönetimi | `app/lib/softtrade.ts` |
| Kullanıcı auth | `app/lib/laravel-auth.ts` |

### API güvenlik proxy (Next.js 16)

`proxy.ts` tüm `/api/*` isteklerinde çalışır (`middleware.ts` Next 16'da deprecated):

| Özellik | Davranış |
|---|---|
| CORS | `CORS_ALLOWED_ORIGINS` (veya localhost varsayılanları); yabancı origin → 403 |
| Rate limit | Auth login/register: 10/dk · Contact: 8/dk · Admin: 60/dk · Diğer API: 120/dk |
| Yanıt | Aşımda `429` + `Retry-After` / `X-RateLimit-*` header'ları |

---

## 🔌 API Endpoint'leri

### Müşteri

| Endpoint | Method | Açıklama |
|---|---|---|
| `/api/auth/login` | POST | Giriş yap |
| `/api/auth/register` | POST | Kayıt ol |
| `/api/auth/me` | GET | Oturum bilgisi |
| `/api/auth/logout` | POST | Çıkış yap |
| `/api/cart` | GET/POST | Sepet listele / ekle |
| `/api/cart/[id]` | PUT/DELETE | Sepet güncelle / sil |
| `/api/cart/clear` | POST | Sepeti temizle |
| `/api/orders` | GET/POST | Siparişler |
| `/api/orders/[id]` | GET | Sipariş detayı |
| `/api/addresses` | GET/POST | Adresler |
| `/api/addresses/[id]` | PUT/DELETE | Adres güncelle / sil |
| `/api/reviews` | POST | Yorum ekle |
| `/api/payments` | POST | Ödeme başlat |

### Admin

| Endpoint | Method | Açıklama |
|---|---|---|
| `/api/admin/products` | GET/POST | Ürün listele / ekle |
| `/api/admin/products/[id]` | PUT/DELETE | Ürün güncelle / sil |
| `/api/admin/products/[id]/image` | POST | Ürün görseli yükle |
| `/api/admin/orders/[id]` | PUT | Sipariş durumu güncelle |
| `/api/admin/reviews/[id]` | PUT | Yorum durumu güncelle |
| `/api/admin/announcements` | GET/POST | Duyuru listele / ekle |
| `/api/admin/announcements/[id]` | PATCH/DELETE | Duyuru güncelle / sil |
| `/api/admin/contacts/[id]` | PUT | İletişim mesajı durumu güncelle |

---

## 🏗️ Proje Yapısı

```
marel-v2/
├── app/                    # Marel Next.js storefront
├── backend/                # Laravel API (junction → SoftTrade/)
│   ├── app/ routes/ database/   # API kaynakları
│   ├── softtrade-client/        # KULLANILMAZ (eski SoftTrade UI)
│   └── README.md
├── SoftTrade/              # Fiziksel backend klasörü (OneDrive kilidi; backend ile aynı)
├── db/                     # Cloudflare D1 şema / seed
├── proxy.ts                # CORS + rate limit
└── ...
```

---

## 🛠️ Npm Scriptleri

| Script | Açıklama |
|---|---|
| `npm run dev` | Yerel geliştirme sunucusunu başlat (varsayılan http://localhost:3000) |
| `npm run build` | Production build oluştur |
| `npm run start` | Production build'i başlat |
| `npm run lint` | ESLint ile kod analizi |
| `npm run db:generate` | Drizzle Kit ile migration oluştur |
| `npm test` | Build + rendered HTML test suite |
| `node --experimental-strip-types --test tests/security.test.mjs` | CORS / rate-limit birim testleri |
| `BASE_URL=http://localhost:3000 node --test tests/smoke-local.mjs` | Çalışan sunucuya karşı smoke (UI+API+CORS+RL) |

---

## 🌐 Production Deploy (Cloudflare)

```bash
# D1 veritabanı oluştur
npx wrangler d1 create marel-commerce

# R2 bucket oluştur
npx wrangler r2 bucket create marel-product-images

# Environment variables ekle (Cloudflare Dashboard veya wrangler secret)
npx wrangler secret put SOFTRADE_API_URL
npx wrangler secret put SOFTRADE_ADMIN_EMAIL
npx wrangler secret put SOFTRADE_ADMIN_PASSWORD
npx wrangler secret put MAREL_ADMIN_EMAILS

# Deploy et
  npm run build
  ```

## Vercel notu

Bu proje `vinext` kullandığı için build çıktısı `.next` değil `dist` klasörüdür. Repo içindeki `vercel.json` bu ayarları otomatik tanımlar:

- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Environment Variable: `NEXT_PUBLIC_SITE_URL=https://marelpliseperde.com`

`next.config.ts` içindeki `output: "standalone"` ayarı ayrıca `dist/standalone/server.js` üretir. Uygulamanın D1, R2 ve `cloudflare:workers` binding'lerine bağlı server route'ları bulunduğu için production runtime olarak Cloudflare Workers önerilir; Vercel build artefact'ı üretir ancak bu binding'ler Vercel'de ayrıca uyarlanmalıdır.

---

## 🔗 GitHub

Repository: **https://github.com/bircany/marel-new**
