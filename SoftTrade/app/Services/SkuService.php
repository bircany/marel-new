<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class SkuService
{
    /**
     * Kategori kodu icin ozel eslestirmeler.
     *
     * @var array<string,string>
     */
    private array $categoryCodeMap = [
        'phone' => 'PHN',
        'phones' => 'PHN',
        'tv' => 'TV',
        'tvs' => 'TV',
        'television' => 'TV',
        'televisions' => 'TV',
    ];

    /**
     * Marka kisaltmasi olustur (ilk 3 harf)
     */
    public function getBrandCode(?Brand $brand): string
    {
        if (! $brand) {
            return 'NOB';
        }

        return $this->defaultCode($brand->name, 3);
    }

    /**
     * Kategori kisaltmasi olustur.
     */
    public function getCategoryCode(?Category $category): string
    {
        if (! $category) {
            return 'NCA';
        }

        $normalized = Str::lower(trim(Str::ascii($category->name)));

        if (isset($this->categoryCodeMap[$normalized])) {
            return $this->categoryCodeMap[$normalized];
        }

        return $this->defaultCode($category->name, 3);
    }

    /**
     * Benzersiz SKU olustur
     * Format: BRAND-CATEGORY-SEQUENCE
     * Ornek: APP-ELE-001, SAM-PHN-042
     */
    public function generateSku(Product $product): string
    {
        $brandCode = $this->getBrandCode($product->brand);
        $categoryCode = $this->getCategoryCode($product->category);

        $count = Product::where('brand_id', $product->brand_id)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->count();

        $sequence = str_pad($count + 1, 3, '0', STR_PAD_LEFT);

        return "{$brandCode}-{$categoryCode}-{$sequence}";
    }

    /**
     * SKU benzersiz degilse benzersiz hale getir.
     */
    public function ensureUniqueSku(string $baseSku): string
    {
        $sku = $baseSku;
        $counter = 1;

        while (Product::where('sku', $sku)->exists()) {
            $baseParts = explode('-', $baseSku);
            $lastPart = array_pop($baseParts);
            $sku = implode('-', $baseParts) . '-' . str_pad((int) $lastPart + $counter, 3, '0', STR_PAD_LEFT);
            $counter++;
        }

        return $sku;
    }

    /**
     * SKU'su olmayan urunleri guncelle.
     *
     * @return array{updated:int,failed:array<int,array<string,mixed>>,total_processed:int}
     */
    public function generateSkuForMissingProducts(): array
    {
        $productsWithoutSku = Product::whereNull('sku')->get();

        $updated = 0;
        $failed = [];

        foreach ($productsWithoutSku as $product) {
            try {
                $baseSku = $this->generateSku($product);
                $sku = $this->ensureUniqueSku($baseSku);

                $product->update(['sku' => $sku]);
                $updated++;
            } catch (\Exception $e) {
                $failed[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'updated' => $updated,
            'failed' => $failed,
            'total_processed' => count($productsWithoutSku),
        ];
    }

    /**
     * Belirli bir urune SKU ata (varsa guncelleme).
     */
    public function assignSkuToProduct(Product $product, bool $force = false): ?string
    {
        if ($product->sku && ! $force) {
            return $product->sku;
        }

        $baseSku = $this->generateSku($product);
        $sku = $this->ensureUniqueSku($baseSku);

        $product->update(['sku' => $sku]);

        return $sku;
    }

    private function defaultCode(string $value, int $length): string
    {
        $normalized = strtoupper(trim(Str::ascii($value)));
        $normalized = preg_replace('/[^A-Z0-9]/', '', $normalized) ?? '';

        if ($normalized === '') {
            return str_repeat('X', $length);
        }

        return substr($normalized, 0, $length);
    }
}