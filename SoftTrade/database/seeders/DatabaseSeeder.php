<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            // Demo elektronik katalog (opsiyonel — SoftTrade örnek verisi)
            // SampleDataSeeder::class,
            // Marel storefront ile senkron marka + ürünler
            MarelCatalogSeeder::class,
        ]);
    }
}
