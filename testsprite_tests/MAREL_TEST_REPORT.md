# Marel v2 — Detaylı Test Raporu / Test Planı

**Tarih:** 2026-09-04  
**Proje:** marel-new (Marel v2)  
**Hedef ortam:** Local (`http://localhost:3002` + SoftTrade `http://localhost:8081/api/v1`)  
**Araç:** TestSprite MCP (bootstrap → plan → execute)  
**Kapsam:** Fonksiyonellik · Admin CRUD · UI · Rate Limit · CORS · Sync/Regresyon · Stress

---

## 1. Yönetici özeti

| Alan | Durum (plan öncesi kontrol) |
|---|---|
| Frontend vinext | Dinliyor (`:3002`) ama `/` **HTTP 500** |
| SoftTrade API `:8081` | **Kapalı / erişilemiyor** |
| TestSprite MCP | **Bağlantı hatası** — Cursor Settings'te MCP auth / yeşil nokta gerekli |
| Rate limit (frontend) | Kodda middleware **yok** (gap) |
| CORS (frontend) | Özel middleware **yok**; Worker/SoftTrade politikası test edilecek |

TestSprite cloud execution başlamadan önce:

1. SoftTrade'i ayağa kaldır (`SOFTRADE_API_URL`)
2. Frontend'in `/` için 200 dönmesini sağla
3. TestSprite MCP'yi Cursor Settings → Tools'tan yeniden bağla / auth tamamla

---

## 2. Test matrisi (özet)

| Suit | ID aralığı | Adet | Öncelik odağı |
|---|---|---|---|
| UI / mağaza | TC-UI-001…004 | 4 | High–Medium |
| Auth / güvenlik | TC-AUTH-001…004, TC-SEC-001 | 5 | High |
| Sepet / sipariş / iletişim | TC-CART/ORDER/CONTACT | 3 | High–Medium |
| Admin CRUD | TC-ADM-* | 7 | High |
| CORS | TC-CORS-001…002 | 2 | High |
| Rate limit | TC-RL-001…003 | 3 | High–Medium |
| Sync / regresyon | TC-SYNC/REG | 4 | High |
| Stress | TC-STRESS-001…003 | 3 | Medium–Low |
| **Toplam** | | **31** | |

Detaylı adımlar: `testsprite_tests/marel_comprehensive_test_plan.json`  
PRD: `testsprite_tests/standard_prd.json`

---

## 3. Admin panel CRUD kapsamı

| Sekme | Create | Read | Update | Delete | Endpoint'ler |
|---|---|---|---|---|---|
| Ürünler | ✓ form | ✓ liste | ✓ fiyat/stok/availability | — (UI'da sil yok) | `/api/admin/products`, `…/[id]`, `…/image` |
| Siparişler | — | ✓ | ✓ status + note | — | `/api/admin/orders/[id]` |
| Yorumlar | — | ✓ | ✓ status + adminReply | — | `/api/admin/reviews/[id]` |
| Duyurular | ✓ | ✓ | ✓ | ✓ | `/api/admin/announcements` |
| Mesajlar | — (müşteri formu) | ✓ | ✓ status | — | `/api/admin/contacts/[id]` |

**Giriş:** `admin@softtrade.com` / `admin123` · `role=admin` zorunlu.

---

## 4. UI işlemleri

- Ana sayfa hero, çok satanlar, kategoriler, duyurular
- Katalog + kategori landing + ürün detay
- Sepet satır işlemleri, AuthPanel (giriş/kayıt)
- Hesabım sipariş kartları / yorumlar
- Sipariş takip progress
- İletişim formu, duyurular, gizlilik sayfası
- Admin gate + 5 sekmeli konsol

---

## 5. Rate limit

**Beklenen davranış:** Brute-force login ve spam contact engellenmeli (429 veya SoftTrade throttle).

**Kod bulgusu:** `marel-new` içinde `rateLimit` / throttle middleware bulunamadı.  
Testler SoftTrade + edge katmanını doğrular; frontend gap'i TC-RL-003 ile raporlanır.

---

## 6. CORS

**Senaryolar:**

- Cross-origin OPTIONS / fetch → Allow-Origin whitelist veya reddedilmeli
- Credentials / cookie sızıntısı olmamalı
- Same-origin `/api/*` browser çağrıları hatasız olmalı

---

## 7. Sync / regresyon

1. Admin fiyat değişikliği → mağaza yansıması  
2. SoftTrade down → D1 fallback (500 olmamalı; auth fail kontrollü)  
3. Sipariş status admin → müşteri sync  
4. Tüm kritik URL smoke (200 / auth gate)

---

## 8. Stress

| Senaryo | Yük | Başarı kriteri |
|---|---|---|
| Ürün listesi | 50 paralel GET | ≥%95 OK, 5xx <%5 |
| Login | 20 paralel | Süreç ayakta; tutarlı 200/401/429 |
| Admin concurrent PATCH | 10 paralel | Veri tutarlılığı |

---

## 9. TestSprite yürütme sırası

```text
1. SoftTrade + frontend sağlıklı
2. testsprite_bootstrap (type: frontend, localPort: 3002, testScope: codebase)
3. testsprite_generate_code_summary
4. testsprite_generate_standardized_prd  (veya standard_prd.json kullan)
5. testsprite_generate_frontend_test_plan (needLogin: true)
6. testsprite_generate_backend_test_plan  (API/CORS/RL/stress)
7. testsprite_generate_code_and_execute
   additionalInstruction: "Execute marel_comprehensive_test_plan.json coverage:
   admin CRUD, UI flows, CORS, rate limit, sync regression, stress"
8. Rapor: testsprite_tests/tmp/test_results.json + HTML
```

**Credentials (TestSprite config):**

- username: `admin@softtrade.com`
- password: `admin123`

---

## 10. Blokerler (şu an)

1. **TestSprite MCP** tool discovery failed — Settings → MCP → TestSprite auth / restart  
2. **SoftTrade `:8081` down** — admin/auth/CRUD testleri bloğu  
3. **Frontend `/` 500** — vinext internal error; SoftTrade/D1 bağımlılığı şüpheli  

Bu blokerler kalkınca TestSprite execution kaldığı yerden devam edecek.
