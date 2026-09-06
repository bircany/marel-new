# Marel Backend (Laravel API)

Bu klasör Marel storefront'un **API backend**'idir (eski SoftTrade Laravel projesi).

> Klasör adı: fiziksel dizin şu an `SoftTrade/` olabilir; kökte `backend` junction'ı aynı içeriği gösterir.
> OneDrive kilidi kalkınca `SoftTrade` → `backend` olarak yeniden adlandırabilirsiniz.

## Marel ile ilişki

| Marel (kök) | Backend |
|---|---|
| `SOFTRADE_API_URL` | `http://localhost:8081/api/v1` |
| `SOFTRADE_ADMIN_EMAIL` | `admin@softtrade.com` |
| `SOFTRADE_ADMIN_PASSWORD` | `admin123` |
| Mağaza UI | Bu repodaki Next.js (`npm run dev`) — **softtrade-client kullanılmaz** |

## Gereksinimler

- PHP 8.2+
- Composer
- SQLite (varsayılan) veya PostgreSQL / Docker

## Kurulum

```bash
cd backend
# veya: cd SoftTrade

composer install
cp .env.example .env
php artisan key:generate

# SQLite dosyası
# Windows PowerShell:
New-Item -ItemType File -Force database/database.sqlite

php artisan migrate --seed
php artisan storage:link

# Marel'in beklediği port: 8081
php artisan serve --host=127.0.0.1 --port=8081
```

Seed içeriği:

- Admin: `admin@softtrade.com` / `admin123` (`role=admin`)
- Müşteri: `user@softtrade.com` / `user123`
- `MarelCatalogSeeder` — Marel markası + mağaza slug'larıyla ürünler

## Docker ile Calistirma (onerilen - Marel)

```bash
# SoftTrade/ veya backend/ icinden:
docker compose up -d --build

# veya monorepo kokunden:
npm run backend:up
```

Servisler:
- Postgres: `localhost:5432` (`marel_backend` / postgres / 123)
- API: `http://localhost:8081` → Marel `SOFTRADE_API_URL=http://localhost:8081/api/v1`

Ilk acilista entrypoint: DB bekle → APP_KEY → migrate → seed (Marel katalog) → serve.

SoftTrade Next istemcisi (`softtrade-client`) compose'da yok; Marel storefront ayri calisir (`npm run dev`).

## Notlar

- `softtrade-client/` SoftTrade'in kendi Next istemcisidir; Marel için **gerekmez**.
- CORS: `config/cors.php` + `.env` içindeki `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS`.
