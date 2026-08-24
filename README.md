# Marel v2

Marel'in plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı ürünleri için hazırlanan tam özellikli e-ticaret uygulaması.  
Stack: **Next.js 16** · **Cloudflare Workers** · **Cloudflare D1 (SQLite)** · **Cloudflare R2** · **SoftTrade (Laravel) Backend**

---

## 🚀 Projeyi Yerel Ortamda Çalıştırma

### Gereksinimler

- Node.js `>= 22.13.0`
- npm

### Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle (aşağıdaki tabloya bak)

# 3. Dev sunucusunu başlat
npm run dev
```

Uygulama **http://localhost:3000** adresinde çalışır.

---

## 🔑 Ortam Değişkenleri

`.env.example` dosyasını kopyalayarak `.env.local` oluştur ve aşağıdaki değerleri doldur:

| Değişken | Açıklama | Örnek Değer |
|---|---|---|
| `MAREL_ADMIN_EMAILS` | Admin paneline erişim izni verilen e-postalar (virgülle ayrılır) | `admin@marel.com,yonetici@marel.com` |
| `SOFTRADE_API_URL` | SoftTrade (Laravel) backend API endpoint | `http://localhost:8081/api/v1` |
| `SOFTRADE_ADMIN_EMAIL` | SoftTrade admin kullanıcı e-postası (backend servis token'ı için) | `admin@softtrade.com` |
| `SOFTRADE_ADMIN_PASSWORD` | SoftTrade admin kullanıcı şifresi (backend servis token'ı için) | `admin123` |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads dönüşüm ID'si (opsiyonel) | `AW-000000000` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Google Ads dönüşüm etiketi (opsiyonel) | `replace-with-conversion-label` |

> **Not:** `.env*` dosyaları `.gitignore` ile repo dışında tutulmaktadır. Asla commit etme.

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

### SoftTrade (Laravel) Backend

Ürünler, siparişler, yorumlar ve kullanıcı auth işlemleri SoftTrade API üzerinden yönetilir.  
D1 fallback olarak kullanılır (SoftTrade erişilemez durumdaysa).

| Özellik | Değer |
|---|---|
| API Base URL | `SOFTRADE_API_URL` env değişkeni |
| Auth yöntemi | Bearer Token (JWT) |
| Admin token yönetimi | `app/lib/softtrade.ts` |
| Kullanıcı auth | `app/lib/laravel-auth.ts` |

---

## 🔐 Admin Paneli — Giriş Bilgileri

### Admin Paneline Erişim

URL: **`http://localhost:3000/admin`**

Admin paneline erişim için **SoftTrade (Laravel) backend'de `role = "admin"` olan bir kullanıcı** ile giriş yapılması gerekir.

### Admin Kullanıcı Giriş Adımları

1. `http://localhost:3000/admin` adresine git
2. "Yönetici girişi" formunda **e-posta** ve **şifre** gir
3. Giriş başarılıysa admin konsolu açılır

### Varsayılan Admin Bilgileri (SoftTrade dev ortamı)

> ⚠️ Bu bilgiler yalnızca **yerel geliştirme** ortamı içindir. Production'da mutlaka değiştir!

| Alan | Değer |
|---|---|
| **E-posta** | `admin@softtrade.com` |
| **Şifre** | `admin123` |
| **Rol** | `admin` |
| **Giriş URL** | `http://localhost:3000/admin` |

### Admin Kimlik Doğrulama Akışı

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

**Oturum cookie'leri:**

| Cookie | Açıklama |
|---|---|
| `marel_token` | SoftTrade JWT Bearer token |
| `marel_session` | Anonim sepet oturum ID'si |

---

## 👤 Müşteri Kullanıcı Girişi

### Müşteri Kayıt / Giriş URL'leri

| İşlem | URL |
|---|---|
| Giriş / Kayıt | Sepet veya Hesabım sayfasından (AuthPanel componenti) |
| Hesabım | `http://localhost:3000/hesabim` |
| Sepet | `http://localhost:3000/sepet` |
| Sipariş Takip | `http://localhost:3000/siparis-takip` |

### Müşteri API Endpoint'leri

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

### Admin API Endpoint'leri

| Endpoint | Method | Açıklama |
|---|---|---|
| `/api/admin/products` | GET/POST | Ürün listele / ekle |
| `/api/admin/products/[id]` | PUT/DELETE | Ürün güncelle / sil |
| `/api/admin/products/[id]/image` | POST | Ürün görseli yükle |
| `/api/admin/orders/[id]` | PUT | Sipariş durumu güncelle |
| `/api/admin/reviews/[id]` | PUT | Yorum durumu güncelle |
| `/api/admin/contacts/[id]` | PUT | İletişim mesajı durumu güncelle |

---

## 📄 Sayfalar

| URL | Açıklama |
|---|---|
| `/` | Ana sayfa — ürün grupları, koleksiyonlar, duyurular, galeri |
| `/urunler` | Ürün kataloğu vitrini |
| `/urunler/[slug]` | Ürün detay sayfası |
| `/sepet` | Sepet |
| `/hesabim` | Müşteri hesap paneli |
| `/siparis-takip` | Sipariş takip |
| `/admin` | **Yönetim paneli** (admin girişi gerekli) |

---

## 🏗️ Proje Yapısı

```
marel-v2/
├── app/
│   ├── admin/              # Admin panel sayfası
│   ├── api/
│   │   ├── admin/          # Admin API route'ları
│   │   ├── auth/           # Kullanıcı auth (login/register/logout/me)
│   │   ├── cart/           # Sepet API
│   │   ├── orders/         # Sipariş API
│   │   ├── addresses/      # Adres API
│   │   ├── payments/       # Ödeme API
│   │   ├── products/       # Ürün API (public)
│   │   ├── reviews/        # Yorum API
│   │   └── contact/        # İletişim formu
│   ├── components/         # UI componentleri
│   ├── lib/
│   │   ├── softtrade.ts    # SoftTrade API istemcisi
│   │   ├── laravel-auth.ts # Auth yardımcı fonksiyonlar
│   │   ├── admin-auth.ts   # Admin yetki kontrolleri
│   │   └── commerce.ts     # Ticaret yardımcıları
│   ├── hesabim/            # Hesabım sayfası
│   ├── sepet/              # Sepet sayfası
│   ├── siparis-takip/      # Sipariş takip sayfası
│   └── urunler/            # Ürün sayfaları
├── db/
│   ├── schema.ts           # Drizzle ORM şeması
│   └── index.ts            # DB bağlantısı, sorgu fonksiyonları, seed data
├── drizzle/                # Drizzle migration dosyaları
├── worker/
│   └── index.ts            # Cloudflare Worker entry point
├── public/                 # Statik dosyalar (görseller)
├── scripts/                # Yardımcı scriptler
├── tests/                  # Test dosyaları
├── .openai/hosting.json    # D1 ve R2 binding konfigürasyonu
├── .env.example            # Ortam değişkenleri şablonu
├── drizzle.config.ts       # Drizzle Kit konfigürasyonu
├── vite.config.ts          # Vite / Cloudflare plugin konfigürasyonu
└── next.config.ts          # Next.js konfigürasyonu
```

---

## 🛠️ Npm Scriptleri

| Script | Açıklama |
|---|---|
| `npm run dev` | Yerel geliştirme sunucusunu başlat (http://localhost:3000) |
| `npm run build` | Production build oluştur |
| `npm run start` | Production build'i başlat |
| `npm run lint` | ESLint ile kod analizi |
| `npm run db:generate` | Drizzle Kit ile migration oluştur |
| `npm test` | Test suite çalıştır |

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

---

## 🔗 GitHub

Repository: **https://github.com/bircany/marel-new**
