<?php

namespace App\Observers;

use App\Models\Product;
use App\Services\SkuService;

class ProductObserver
{
    public function __construct(
        private SkuService $skuService
    ) {}

    /**
     * Ürün oluşturulmadan önce SKU oluştur
     */
    public function creating(Product $product): void
    {
        // Eğer SKU boşsa otomatik oluştur
        if (!$product->sku) {
            $baseSku = $this->skuService->generateSku($product);
            $product->sku = $this->skuService->ensureUniqueSku($baseSku);
        }
    }

    /**
     * Ürün güncellenirken kategori/marka değişirse SKU'yu da güncelle
     */
    public function updating(Product $product): void
    {
        // Marka veya kategori değişmişse ve SKU boşsa, yeni SKU oluştur
        if (($product->isDirty('brand_id') || $product->isDirty('category_id')) && !$product->sku) {
            $baseSku = $this->skuService->generateSku($product);
            $product->sku = $this->skuService->ensureUniqueSku($baseSku);
        }
    }
}
