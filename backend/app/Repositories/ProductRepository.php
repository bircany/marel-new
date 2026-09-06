<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Product::with(['category', 'brand', 'coverImage'])
            ->active()
            ->when($filters['category_id'] ?? null, fn ($q, $v) => $q->byCategory($v))
            ->when($filters['brand_id']    ?? null, fn ($q, $v) => $q->byBrand($v))
            ->when($filters['search']      ?? null, fn ($q, $v) => $q->where('name', 'ilike', "%{$v}%"))
            ->when($filters['on_sale']     ?? false, fn ($q) => $q->onSale())
            ->paginate($perPage);
    }

    public function findBySlug(string $slug): Product
    {
        return Product::with(['category', 'brand', 'images', 'variants', 'approvedReviews'])
                      ->where('slug', $slug)
                      ->firstOrFail();
    }
}
