<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Kategoriler ───────────────────────────────────────────────
        $elektronik = Category::create(['name' => 'Elektronik', 'slug' => 'elektronik']);
        $telefon    = Category::create(['name' => 'Telefon', 'slug' => 'telefon', 'parent_id' => $elektronik->id]);
        $bilgisayar = Category::create(['name' => 'Bilgisayar', 'slug' => 'bilgisayar', 'parent_id' => $elektronik->id]);
        $aksesuar   = Category::create(['name' => 'Aksesuar', 'slug' => 'aksesuar', 'parent_id' => $elektronik->id]);
        $giyim      = Category::create(['name' => 'Giyim', 'slug' => 'giyim']);
        $erkek      = Category::create(['name' => 'Erkek Giyim', 'slug' => 'erkek-giyim', 'parent_id' => $giyim->id]);
        $kadin      = Category::create(['name' => 'Kadın Giyim', 'slug' => 'kadin-giyim', 'parent_id' => $giyim->id]);
        $evYasam    = Category::create(['name' => 'Ev & Yaşam', 'slug' => 'ev-yasam']);
        $spor       = Category::create(['name' => 'Spor & Outdoor', 'slug' => 'spor-outdoor']);

        // ── Markalar ──────────────────────────────────────────────────
        $apple    = Brand::create(['name' => 'Apple',   'slug' => 'apple']);
        $samsung  = Brand::create(['name' => 'Samsung', 'slug' => 'samsung']);
        $sony     = Brand::create(['name' => 'Sony',    'slug' => 'sony']);
        $nike     = Brand::create(['name' => 'Nike',    'slug' => 'nike']);
        $adidas   = Brand::create(['name' => 'Adidas',  'slug' => 'adidas']);
        $jbl      = Brand::create(['name' => 'JBL',     'slug' => 'jbl']);
        $dyson    = Brand::create(['name' => 'Dyson',   'slug' => 'dyson']);
        $lenovo   = Brand::create(['name' => 'Lenovo',  'slug' => 'lenovo']);

        // ── Ürünler ───────────────────────────────────────────────────
        $products = [
            // Telefon
            [
                'name' => 'iPhone 15 Pro Max',
                'description' => 'Apple\'ın en güçlü telefonu. A17 Pro çip, 48MP kamera, titanyum tasarım.',
                'price' => 74999.00,
                'sale_price' => 69999.00,
                'stock' => 25,
                'sku' => 'APL-IP15PM-256',
                'category_id' => $telefon->id,
                'brand_id' => $apple->id,
                'status' => 'active',
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'description' => 'Galaxy AI ile donatılmış en gelişmiş Samsung telefon. 200MP kamera, S Pen.',
                'price' => 64999.00,
                'sale_price' => null,
                'stock' => 30,
                'sku' => 'SAM-S24U-256',
                'category_id' => $telefon->id,
                'brand_id' => $samsung->id,
                'status' => 'active',
            ],
            [
                'name' => 'iPhone 14',
                'description' => 'Çift kamera sistemi, A15 Bionic çip, gün boyu pil ömrü.',
                'price' => 42999.00,
                'sale_price' => 37999.00,
                'stock' => 45,
                'sku' => 'APL-IP14-128',
                'category_id' => $telefon->id,
                'brand_id' => $apple->id,
                'status' => 'active',
            ],

            // Bilgisayar
            [
                'name' => 'MacBook Air M3',
                'description' => '13.6 inç Liquid Retina, M3 çip, 18 saat pil ömrü, fanless tasarım.',
                'price' => 49999.00,
                'sale_price' => 46999.00,
                'stock' => 15,
                'sku' => 'APL-MBA-M3-256',
                'category_id' => $bilgisayar->id,
                'brand_id' => $apple->id,
                'status' => 'active',
            ],
            [
                'name' => 'Lenovo ThinkPad X1 Carbon',
                'description' => '14 inç 2.8K OLED, Intel Core Ultra 7, 32GB RAM, 1TB SSD.',
                'price' => 52999.00,
                'sale_price' => null,
                'stock' => 12,
                'sku' => 'LEN-X1C-GEN12',
                'category_id' => $bilgisayar->id,
                'brand_id' => $lenovo->id,
                'status' => 'active',
            ],

            // Aksesuar
            [
                'name' => 'AirPods Pro 2. Nesil',
                'description' => 'Aktif gürültü engelleme, uyarlanabilir ses, MagSafe şarj kutusu.',
                'price' => 8999.00,
                'sale_price' => 7499.00,
                'stock' => 60,
                'sku' => 'APL-APP2-USB',
                'category_id' => $aksesuar->id,
                'brand_id' => $apple->id,
                'status' => 'active',
            ],
            [
                'name' => 'JBL Charge 5 Bluetooth Hoparlör',
                'description' => 'IP67 su ve toz geçirmez, 20 saat pil, powerbank fonksiyonu.',
                'price' => 4299.00,
                'sale_price' => 3599.00,
                'stock' => 40,
                'sku' => 'JBL-CHG5-BLK',
                'category_id' => $aksesuar->id,
                'brand_id' => $jbl->id,
                'status' => 'active',
            ],
            [
                'name' => 'Sony WH-1000XM5 Kulaklık',
                'description' => 'Endüstri lideri gürültü engelleme, 30 saat pil, çoklu cihaz bağlantısı.',
                'price' => 11999.00,
                'sale_price' => 9999.00,
                'stock' => 20,
                'sku' => 'SNY-WH1000XM5',
                'category_id' => $aksesuar->id,
                'brand_id' => $sony->id,
                'status' => 'active',
            ],
            [
                'name' => 'Samsung Galaxy Watch 6 Classic',
                'description' => 'Döner çerçeve, Super AMOLED, vücut kompozisyonu analizi.',
                'price' => 12999.00,
                'sale_price' => null,
                'stock' => 18,
                'sku' => 'SAM-GW6C-47',
                'category_id' => $aksesuar->id,
                'brand_id' => $samsung->id,
                'status' => 'active',
            ],

            // Giyim - Erkek
            [
                'name' => 'Nike Dri-FIT Erkek Tişört',
                'description' => 'Nefes alabilir kumaş, ter emici teknoloji, rahat kesim.',
                'price' => 749.00,
                'sale_price' => 599.00,
                'stock' => 100,
                'sku' => 'NKE-DRF-TSH-M',
                'category_id' => $erkek->id,
                'brand_id' => $nike->id,
                'status' => 'active',
            ],
            [
                'name' => 'Adidas Ultraboost Light Koşu Ayakkabısı',
                'description' => 'Light BOOST köpük, Continental™ kauçuk taban, Primeknit+ üst.',
                'price' => 5499.00,
                'sale_price' => 4299.00,
                'stock' => 35,
                'sku' => 'ADI-UBL-BLK-42',
                'category_id' => $erkek->id,
                'brand_id' => $adidas->id,
                'status' => 'active',
            ],

            // Giyim - Kadın
            [
                'name' => 'Nike Air Max 270 Kadın',
                'description' => 'Max Air ünitesi, hafif yapı, retro tasarım.',
                'price' => 4799.00,
                'sale_price' => null,
                'stock' => 28,
                'sku' => 'NKE-AM270-W-38',
                'category_id' => $kadin->id,
                'brand_id' => $nike->id,
                'status' => 'active',
            ],

            // Ev & Yaşam
            [
                'name' => 'Dyson V15 Detect Kablosuz Süpürge',
                'description' => 'Lazer toz algılama, LCD ekran, 60 dk çalışma süresi.',
                'price' => 24999.00,
                'sale_price' => 21999.00,
                'stock' => 8,
                'sku' => 'DYS-V15-DET',
                'category_id' => $evYasam->id,
                'brand_id' => $dyson->id,
                'status' => 'active',
            ],
            [
                'name' => 'Dyson Pure Cool Hava Temizleyici',
                'description' => 'HEPA H13 filtre, 350° salınım, uygulama kontrolü.',
                'price' => 18999.00,
                'sale_price' => null,
                'stock' => 5,
                'sku' => 'DYS-TP07-WS',
                'category_id' => $evYasam->id,
                'brand_id' => $dyson->id,
                'status' => 'active',
            ],

            // Spor
            [
                'name' => 'Nike Revolution 6 Koşu Ayakkabısı',
                'description' => 'Yumuşak köpük taban, nefes alabilir üst, günlük koşu için ideal.',
                'price' => 1999.00,
                'sale_price' => 1499.00,
                'stock' => 50,
                'sku' => 'NKE-REV6-BLK',
                'category_id' => $spor->id,
                'brand_id' => $nike->id,
                'status' => 'active',
            ],
            [
                'name' => 'Adidas Aeroready Antrenman Şortu',
                'description' => 'AEROREADY nem yönetimi, hafif kumaş, yan cepler.',
                'price' => 599.00,
                'sale_price' => null,
                'stock' => 80,
                'sku' => 'ADI-ARDY-SHT',
                'category_id' => $spor->id,
                'brand_id' => $adidas->id,
                'status' => 'active',
            ],
        ];

        foreach ($products as $data) {
            $data['slug'] = Str::slug($data['name']);
            Product::create($data);
        }
    }
}
