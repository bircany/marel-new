<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'sale_price',
        'stock',
        'sku',
        'status',
        'attributes',
        'measurement_mode',
        'stock_mode',
        'is_made_to_order',
        'weight',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'price'       => 'decimal:2',
            'sale_price'  => 'decimal:2',
            'weight'      => 'decimal:3',
            'attributes'  => 'array',   // jsonb â†’ PHP array
            'is_made_to_order' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    // ── Accessor'lar ──────────────────────────────────────────────────────────

    /** Fiyatı formatlı döndür: "1.299,90 ₺" */
    protected function formattedPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => number_format((float) $this->price, 2, ',', '.') . ' ₺'
        );
    }

    /** İndirimli fiyatı formatlı döndür */
    protected function formattedSalePrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->sale_price
                ? number_format((float) $this->sale_price, 2, ',', '.') . ' ₺'
                : null
        );
    }

    /** Ürün indirimde mi? */
    protected function isOnSale(): Attribute
    {
        return Attribute::make(
            get: fn () => ! is_null($this->sale_price)
                && (float) $this->sale_price > 0
                && (float) $this->sale_price < (float) $this->price
        );
    }

    /** İndirim yüzdesi: 25 (yüzde işareti olmadan) */
    protected function discountPercentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->is_on_sale) {
                    return null;
                }
                return (int) round(
                    (($this->price - $this->sale_price) / $this->price) * 100
                );
            }
        );
    }

    /** Aktif fiyat: indirimli varsa onu, yoksa normal fiyatı döndür */
    protected function currentPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->is_on_sale ? $this->sale_price : $this->price
        );
    }

    // ── İlişkiler ─────────────────────────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function coverImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_cover', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
    }

    public function optionAxes(): HasMany
    {
        return $this->hasMany(ProductOptionAxis::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function customMeasurementRule(): HasOne
    {
        return $this->hasOne(ProductCustomMeasurementRule::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    // ── Scope'lar ─────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOnSale($query)
    {
        return $query->whereNotNull('sale_price')
                     ->whereColumn('sale_price', '<', 'price');
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByBrand($query, int $brandId)
    {
        return $query->where('brand_id', $brandId);
    }

    public function scopePriceBetween($query, float $min, float $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeWithoutSku($query)
    {
        return $query->whereNull('sku');
    }

    public function scopeWithSku($query)
    {
        return $query->whereNotNull('sku');
    }

    // ── SKU Yönetimi ──────────────────────────────────────────────────────────

    /**
     * Bu ürüne SKU ata (varsa güncelle)
     */
    public function generateSkuIfMissing(): self
    {
        if (!$this->sku) {
            $skuService = app(\App\Services\SkuService::class);
            $this->sku = $skuService->generateSku($this);
            $this->sku = $skuService->ensureUniqueSku($this->sku);
        }
        return $this;
    }
}

