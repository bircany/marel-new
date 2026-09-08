# Marel E-Ticaret Platformu (v2)

Marel'in plise perde, jaluzi, zip perde, sineklik ve sürgülü kapı sistemleri için geliştirilmiş, yüksek performanslı ve tam özellikli modern e-ticaret platformu.

**Teknoloji Yığını:**
- **Frontend & BFF (Backend-for-Frontend):** Next.js 16 (App Router & Turbopack)
- **Veritabanı:** Supabase PostgreSQL (Havuzlayıcı / Pooler destekli)
- **Kimlik Doğrulama & Oturum:** Next.js JWT / Secure Cookies
- **Tasarım & UI:** Modern Vanilla CSS, CSS Değişkenleri & Design Tokens
- **Dağıtım (Deployment):** Vercel & Node.js Runtime

---

## ⚡ Mimari: Yerleşik BFF (Backend-for-Frontend)

Proje, harici bir PHP, Laravel veya Docker sunucusu kurulumu gerektirmeksizin **tamamen bağımsız (self-contained)** bir BFF mimarisine sahiptir.
Next.js içerisindeki `/api/*` uç noktaları doğrudan Supabase PostgreSQL veritabanı ile konuşur.

### Neler Dahil?
1. **Sipariş & Kargo Motoru:** Dinamik MRL-XXXXXX sipariş numarası üretimi, kalemler, kargo takip linki oluşturma ve durum geçmişi.
2. **Katalog & Konfigüratör:** 227 hazır ürün ve görseli, özel en/boy ölçü hesaplayıcısı, kumaş ve profil opsiyonları.
3. **Admin Yönetim Paneli (`/admin`):**
   - **Siparişler:** Detaylı sipariş takibi, WhatsApp bildirim kısayolu, kargo firması & takip no güncelleme.
   - **Müşteriler (CRM):** Müşteri bazlı toplam harcama, sipariş sayısı ve son hareket analizi.
   - **Kuponlar:** Yüzdelik veya sabit TL indirim kuponu oluşturma ve kullanım limitleri.
   - **Site Ayarları & Bakım:** Canlı site ayarları ve bakım modu toggle desteği.
   - **Güvenlik & Loglar:** Denetim ve güvenlik hareketleri.
4. **SEO & Yasal Altyapı:** Dinamik `sitemap.xml`, `robots.txt`, schema.org (Product, FAQPage) yapılandırılmış verileri, OpenGraph kartları ve eksiksiz yasal sayfalar.

---

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Node.js `>= 20.0.0`
- Bir Supabase PostgreSQL projesi (veya herhangi bir standart PostgreSQL veritabanı)

### 2. Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/bircany/marel-new.git
cd marel-new

# Bağımlılıkları yükleyin
npm install
```

### 3. Ortam Değişkenleri (`.env.local`)

Proje kök dizininde `.env.local` dosyası oluşturun ve Supabase bağlantı adresinizi girin:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[POOLER_HOST]:6543/postgres"
```

> **İpucu:** Supabase Dashboard → **Project Settings** → **Database** → **Connection string (URI / Session / Transaction Mode)** bölümünden alabilirsiniz.

### 4. Veritabanı Şemasını Başlatma

Veritabanındaki 11 tabloyu ve gerekli indeksleri tek komutla oluşturmak için:

```bash
npm run db:setup
```

### 5. Geliştirme Sunucusunu Başlatma

```bash
npm run dev
```

Tarayıcınızda **http://localhost:3000** adresini açabilirsiniz.

---

## 🛠️ Npm Komutları

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır (`http://localhost:3000`) |
| `npm run build` | Üretim derlemesini çalıştırır (TypeScript & Turbopack doğrulaması) |
| `npm run start` | Derlenmiş üretim sürümünü sunar |
| `npm run db:setup` | Supabase PostgreSQL şemasını kurar ve tabloları oluşturur |
| `npm run lint` | ESLint ile kod standartlarını denetler |
| `node test-e2e.mjs` | 21 adımlı E2E güvenlik, API, sipariş ve vitrin test paketini çalıştırır |

---

## 🗄️ Veritabanı Tabloları

Veritabanı ilişkisel PostgreSQL şemasıyla modellenmiştir:

- `products` — Ürün kataloğu, fiyatlar, varyasyonlar ve stok durumu
- `product_images` — Ürün görsel galerisi
- `orders` — Sipariş başlık bilgileri, müşteri verileri, kargo detayları
- `order_items` — Sipariş kalemleri ve özel ölçü konfigürasyonları (JSON)
- `order_events` — Sipariş durum geçmişi
- `coupons` — İndirim kuponları ve kullanım limitleri
- `reviews` — Müşteri değerlendirmeleri ve onay durumu
- `announcements` — Duyurular ve blog içerikleri
- `contact_messages` — İletişim formu mesajları
- `site_settings` — Canlı site ayarları ve konfigürasyonlar
- `users` — Kullanıcı ve yönetici hesapları

---

## 🌐 Vercel Dağıtımı (Deployment)

Proje Vercel ile %100 uyumludur.

1. **GitHub Entegrasyonu:** Projeyi GitHub'a push ettiğinizde Vercel otomatik derlemeyi başlatır.
2. **Ortam Değişkeni Tanımlama:** Vercel projenizde **Settings → Environment Variables** bölümüne giderek `DATABASE_URL` değişkenini tanımlayın.
3. Başka hiçbir ek servis, sunucu veya PHP/Laravel ortamı kurmanıza gerek yoktur.

---

## 🔗 GitHub Deposu

Repository: **https://github.com/bircany/marel-new**
