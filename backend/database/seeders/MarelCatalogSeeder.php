<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

/**
 * Marel storefront ile senkron katalog (slug'lar app/page.tsx / urunler ile uyumlu).
 */
class MarelCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $brand = Brand::updateOrCreate(
            ['slug' => 'marel'],
            ['name' => 'Marel']
        );

        $plise = Category::updateOrCreate(
            ['slug' => 'plise-perde'],
            ['name' => 'Plise Perde', 'parent_id' => null]
        );
        $honeycomb = Category::updateOrCreate(
            ['slug' => 'honeycomb'],
            ['name' => 'Honeycomb', 'parent_id' => $plise->id]
        );
        $diamond = Category::updateOrCreate(
            ['slug' => 'diamond'],
            ['name' => 'Diamond', 'parent_id' => $plise->id]
        );
        $blackout = Category::updateOrCreate(
            ['slug' => 'blackout'],
            ['name' => 'Blackout', 'parent_id' => $plise->id]
        );
        $silver = Category::updateOrCreate(
            ['slug' => 'silver'],
            ['name' => 'Silver', 'parent_id' => $plise->id]
        );

        $products = [
            [
                'sku' => 'HC-003',
                'slug' => 'honeycomb-003-gri',
                'name' => 'Honeycomb 003 Gri Isı Yalıtımlı Plise Perde',
                'description' => 'Hücresel yapılı, ısı yalıtımlı ve ölçüye özel plise perde.',
                'price' => 1166.00,
                'stock' => 12,
                'category_id' => $honeycomb->id,
                'image' => '/images/real/honeycomb-gri-detay.png',
            ],
            [
                'sku' => 'DIA-100',
                'slug' => 'diamond-100-beyaz',
                'name' => 'Diamond 100 Beyaz Plise Perde',
                'description' => '%50 ışık filtrasyonlu, UV dayanımlı ölçüye özel plise perde.',
                'price' => 1166.00,
                'stock' => 18,
                'category_id' => $diamond->id,
                'image' => '/images/real/diamond-beyaz.jpeg',
            ],
            [
                'sku' => 'DIA-102',
                'slug' => 'diamond-102-gri',
                'name' => 'Diamond 102 Gri Plise Perde',
                'description' => 'Kolay temizlenebilir gri polyester doku.',
                'price' => 1166.00,
                'stock' => 14,
                'category_id' => $diamond->id,
                'image' => '/images/real/diamond-gri.jpeg',
            ],
            [
                'sku' => 'BLK-05',
                'slug' => 'blackout-05-siyah',
                'name' => 'Blackout 05 Siyah Tam Karartma',
                'description' => '%100 ışık kontrolü sağlayan tam karartma kumaşı.',
                'price' => 1499.00,
                'stock' => 8,
                'category_id' => $blackout->id,
                'image' => '/images/catalog/blackout.webp',
            ],
            [
                'sku' => 'HC-001',
                'slug' => 'honeycomb-001-beyaz',
                'name' => 'Honeycomb 001 Beyaz Isı Yalıtımlı Perde',
                'description' => 'Hücresel dokulu, %100 polyester ve ısı yalıtımlı ölçüye özel plise perde.',
                'price' => 1166.00,
                'stock' => 10,
                'category_id' => $honeycomb->id,
                'image' => '/images/real/diamond-beyaz-siyah-ip.jpeg',
            ],
            [
                'sku' => 'DIA-108',
                'slug' => 'diamond-108-krem',
                'name' => 'Diamond 108 Krem Plise Perde',
                'description' => '%50 ışık filtrasyonlu, yumuşak gün ışığı sağlayan ölçüye özel plise perde.',
                'price' => 1166.00,
                'stock' => 15,
                'category_id' => $diamond->id,
                'image' => '/images/real/diamond-krem.jpeg',
            ],
            [
                'sku' => 'DIA-109',
                'slug' => 'diamond-109-acik-gri',
                'name' => 'Diamond 109 Açık Gri Plise Perde',
                'description' => 'UV dayanımlı, kolay temizlenebilir açık gri polyester doku.',
                'price' => 1166.00,
                'stock' => 13,
                'category_id' => $diamond->id,
                'image' => '/images/real/diamond-acik-gri.jpeg',
            ],
            [
                'sku' => 'SLV-7002',
                'slug' => 'silver-7002-gri',
                'name' => 'Silver 7002 Gri Plise Perde',
                'description' => '%70 ışık filtrasyonlu, 150 gr/m² UV dayanımlı kumaş.',
                'price' => 1166.00,
                'stock' => 16,
                'category_id' => $silver->id,
                'image' => '/images/catalog/silver.webp',
            ],
        ];

        foreach ($products as $row) {
            $product = Product::updateOrCreate(
                ['sku' => $row['sku']],
                [
                    'name' => $row['name'],
                    'slug' => $row['slug'],
                    'description' => $row['description'],
                    'price' => $row['price'],
                    'sale_price' => null,
                    'stock' => $row['stock'],
                    'category_id' => $row['category_id'],
                    'brand_id' => $brand->id,
                    'status' => 'active',
                ]
            );

            if (! ProductImage::query()->where('product_id', $product->id)->exists()) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $row['image'],
                    'alt_text' => $row['name'],
                    'is_cover' => true,
                    'sort_order' => 0,
                ]);
            }
        }
    }
}
