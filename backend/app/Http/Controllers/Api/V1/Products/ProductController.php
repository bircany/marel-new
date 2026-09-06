<?php

namespace App\Http\Controllers\Api\V1\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\PreviewPriceRequest;
use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;
use App\Http\Resources\Api\V1\ProductDetailResource;
use App\Http\Resources\Api\V1\ProductImageResource;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Resources\Api\V1\ProductVariantResource;
use App\Models\MediaAsset;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOptionAxis;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use App\Services\ProductPricingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    use ApiResponse;

    // â”€â”€ PUBLIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * GET /api/v1/products
     *
     * Desteklenen query parametreleri:
     *   ?category_id=5          â†’ Kategori filtresi
     *   ?brand_id=3             â†’ Marka filtresi
     *   ?min_price=100          â†’ Minimum fiyat
     *   ?max_price=5000         â†’ Maksimum fiyat
     *   ?search=iphone          â†’ Ad iÃ§inde arama (ilike â€” case insensitive)
     *   ?status=active          â†’ Durum filtresi (varsayÄ±lan: active)
     *   ?in_stock=true          â†’ Sadece stokta olanlar
     *   ?featured=true          â†’ Ã–ne Ã§Ä±kan Ã¼rÃ¼nler
     *   ?on_sale=true           â†’ Ä°ndirimli Ã¼rÃ¼nler
     *   ?sort_by=price          â†’ SÄ±ralama alanÄ±: price|created_at|view_count|name
     *   ?sort_dir=asc           â†’ SÄ±ralama yÃ¶nÃ¼: asc|desc
     *   ?per_page=20            â†’ Sayfa baÅŸÄ±na Ã¼rÃ¼n sayÄ±sÄ± (max 100)
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $query = Product::with(['category', 'brand', 'coverImage'])
            ->where('status', $request->get('status', 'active'));

        // â”€â”€ Filtreler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if ($request->filled('category_id')) {
            $query->byCategory((int) $request->category_id);
        }

        if ($request->filled('brand_id')) {
            $query->byBrand((int) $request->brand_id);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('short_description', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%");
            });
        }

        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->boolean('on_sale')) {
            $query->onSale();
        }

        // â”€â”€ SÄ±ralama â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        $allowedSorts = ['price', 'created_at', 'view_count', 'name', 'stock'];
        $sortBy  = in_array($request->sort_by, $allowedSorts) ? $request->sort_by : 'created_at';
        $sortDir = in_array(strtolower($request->sort_dir ?? ''), ['asc', 'desc'])
            ? strtolower($request->sort_dir)
            : 'desc';

        $query->orderBy($sortBy, $sortDir);

        // â”€â”€ Sayfalama â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        $perPage = min((int) ($request->per_page ?? 20), 100);
        $products = $query->paginate($perPage);

        return $this->success(
            ProductResource::collection($products),
            meta: [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'from'         => $products->firstItem(),
                'to'           => $products->lastItem(),
            ]
        );
    }

    /**
     * GET /api/v1/products/{slug}
     *
     * Slug ile Ã¼rÃ¼n detayÄ±. view_count artar.
     */
    public function show(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        $product->load([
            'category',
            'brand',
            'images',
            'variants.optionValues',
            'optionAxes.values',
            'customMeasurementRule',
            'approvedReviews.user',
        ]);

        $product->increment('view_count');

        return $this->success(new ProductDetailResource($product));
    }

    /**
     * POST /api/v1/products/{slug}/price-preview
     */
    public function previewPrice(
        PreviewPriceRequest $request,
        Product $product,
        ProductPricingService $pricingService
    ): JsonResponse {
        $this->authorize('view', $product);

        $validated = $request->validated();
        $variant = null;

        if (!empty($validated['variant_id'])) {
            $variant = ProductVariant::findOrFail($validated['variant_id']);
            if ($variant->product_id !== $product->id) {
                return $this->error('Secilen varyant bu urune ait degil.', 422);
            }
        }

        try {
            $preview = $pricingService->calculate($product->loadMissing('customMeasurementRule'), $validated, $variant);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }

        return $this->success($preview, 'Fiyat onizleme hesaplandi.');
    }

    // ── ADMIN ───────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/admin/products/{product}
     *
     * Admin panelinde id ile urun detay cekimi.
     */
    public function adminShow(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        return $this->success(
            new ProductDetailResource($product->load([
                'category',
                'brand',
                'images',
                'variants.optionValues',
                'optionAxes.values',
                'customMeasurementRule',
            ]))
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        DB::beginTransaction();
        try {
            $data = $request->safe()->except(['images', 'variants', 'media_asset_ids', 'custom_measurement_rule']);
            $product = Product::create($data);
            $customRule = $request->input('custom_measurement_rule');

            if (($data['measurement_mode'] ?? 'fixed') === 'custom' && !is_array($customRule)) {
                throw new \InvalidArgumentException('Serbest olcu modu icin custom_measurement_rule zorunludur.');
            }

            // Coklu gorsel yukleme
            if ($request->hasFile('images')) {
                $this->handleImageUpload($product, $request->file('images', []), true);
            }

            $mediaAssetIds = $request->safe()->only('media_asset_ids')['media_asset_ids'] ?? [];
            if (!empty($mediaAssetIds)) {
                $this->attachMediaAssets($product, $mediaAssetIds, ! $request->hasFile('images'));
            }

            // Varyantlari Yukleme
            $variants = $request->safe()->only('variants')['variants'] ?? [];
            if (!empty($variants)) {
                foreach ($variants as $variantData) {
                    $product->variants()->create([
                        'name'           => $variantData['name'],
                        'value'          => $variantData['value'],
                        'price_modifier' => $variantData['price_modifier'] ?? 0,
                        'stock'          => $variantData['stock'] ?? 0,
                        'is_active'      => true,
                    ]);
                }
            }

            if ($product->measurement_mode === 'custom' && is_array($customRule)) {
                $product->customMeasurementRule()->updateOrCreate(
                    ['product_id' => $product->id],
                    $customRule
                );
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $status = $e instanceof \InvalidArgumentException ? 422 : 500;
            return $this->error('Urun olusturulamadi: ' . $e->getMessage(), $status);
        }

        return $this->created(
            new ProductDetailResource($product->load([
                'category',
                'brand',
                'images',
                'variants.optionValues',
                'optionAxes.values',
                'customMeasurementRule',
            ])),
            'Urun basariyla olusturuldu.'
        );
    }

    /**
     * PUT /api/v1/admin/products/{product}
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $validated = $request->validated();
        $hasCustomRuleInput = $request->has('custom_measurement_rule');
        $customRule = $validated['custom_measurement_rule'] ?? null;
        $targetMeasurementMode = $validated['measurement_mode'] ?? $product->measurement_mode;
        unset($validated['custom_measurement_rule']);

        if ($targetMeasurementMode === 'custom') {
            $hasExistingRule = $product->customMeasurementRule()->exists();
            if ($hasCustomRuleInput && !is_array($customRule)) {
                return $this->error('Serbest olcu modu icin custom_measurement_rule gecerli olmalidir.', 422);
            }
            if (!$hasCustomRuleInput && !$hasExistingRule) {
                return $this->error('Serbest olcu modu icin custom_measurement_rule zorunludur.', 422);
            }
        }

        $product->update($validated);

        if ($hasCustomRuleInput) {
            if ($product->measurement_mode === 'custom' && is_array($customRule)) {
                $product->customMeasurementRule()->updateOrCreate(
                    ['product_id' => $product->id],
                    $customRule
                );
            } else {
                $product->customMeasurementRule()->delete();
            }
        }

        return $this->success(
            new ProductDetailResource($product->fresh([
                'category',
                'brand',
                'images',
                'variants.optionValues',
                'optionAxes.values',
                'customMeasurementRule',
            ])),
            'Urun guncellendi.'
        );
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        // TÃ¼m gÃ¶rselleri storage'dan sil
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $product->delete();

        return $this->noContent();
    }

    // â”€â”€ GÃ–RSEL YÃ–NETÄ°MÄ° â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * POST /api/v1/admin/products/{product}/images
     *
     * Ã‡oklu gÃ¶rsel yÃ¼kleme.
     * Ä°stekte ilk gÃ¶rsel, mevcut cover yoksa otomatik cover yapÄ±lÄ±r.
     *
     * Request body (multipart/form-data):
     *   images[] â€” birden fazla dosya
     *   set_first_as_cover â€” boolean (varsayÄ±lan: true)
     */
    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $request->validate([
            'images'   => ['required', 'array', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'set_first_as_cover' => ['boolean'],
        ], [
            'images.*.uploaded' => 'Dosya yÃ¼klenemedi. Dosya boyutu sÄ±nÄ±rÄ± aÅŸÄ±lÄ±yor olabilir.',
            'images.*.max' => 'Her gÃ¶rsel en fazla 10MB olabilir.',
        ]);

        $files = $request->file('images', []);
        $setFirstAsCover = $request->boolean('set_first_as_cover', true);
        $uploaded = $this->handleImageUpload($product, $files, $setFirstAsCover);

        return $this->created(
            ProductImageResource::collection(collect($uploaded)),
            'GÃ¶rseller yÃ¼klendi.'
        );
    }

    /**
     * @param array<int, \Illuminate\Http\UploadedFile> $files
     * @return array<int, \App\Models\ProductImage>
     */
    private function handleImageUpload(Product $product, array $files, bool $setFirstAsCover = false): array
    {
        if (empty($files)) {
            return [];
        }

        $hasCover = $product->images()->where('is_cover', true)->exists();
        $sortBase = $product->images()->max('sort_order') ?? -1;

        $uploaded = [];
        foreach ($files as $i => $file) {
            $isCover = ! $hasCover && $setFirstAsCover && $i === 0;

            if ($isCover) {
                // Eski cover'Ä± kaldÄ±r (normalde olmamalÄ± ama savunmacÄ± programlama)
                $product->images()->where('is_cover', true)->update(['is_cover' => false]);
            }

            $path = $file->store('products', 'public');

            $image = $product->images()->create([
                'path'       => $path,
                'alt_text'   => $product->name,
                'is_cover'   => $isCover,
                'sort_order' => $sortBase + $i + 1,
            ]);

            $uploaded[] = $image;

            if ($isCover) {
                $hasCover = true;
            }
        }

        return $uploaded;
    }

    /**
     * @param array<int, int> $assetIds
     * @return array<int, ProductImage>
     */
    private function attachMediaAssets(Product $product, array $assetIds, bool $setFirstAsCover = false): array
    {
        if (empty($assetIds)) {
            return [];
        }

        $assets = MediaAsset::query()
            ->whereIn('id', $assetIds)
            ->get()
            ->keyBy('id');

        $orderedAssets = collect($assetIds)
            ->map(fn (int $id) => $assets->get($id))
            ->filter()
            ->values();

        $hasCover = $product->images()->where('is_cover', true)->exists();
        $sortBase = $product->images()->max('sort_order') ?? -1;
        $created = [];

        foreach ($orderedAssets as $i => $asset) {
            if (!Storage::disk($asset->disk)->exists($asset->path)) {
                continue;
            }

            $ext = pathinfo($asset->path, PATHINFO_EXTENSION);
            $newPath = 'products/' . Str::random(40) . ($ext ? '.' . $ext : '');
            Storage::disk($asset->disk)->copy($asset->path, $newPath);

            $isCover = ! $hasCover && $setFirstAsCover && $i === 0;
            if ($isCover) {
                $product->images()->where('is_cover', true)->update(['is_cover' => false]);
            }

            $created[] = $product->images()->create([
                'path' => $newPath,
                'alt_text' => $asset->alt_text ?: $product->name,
                'is_cover' => $isCover,
                'sort_order' => $sortBase + $i + 1,
            ]);

            if ($isCover) {
                $hasCover = true;
            }
        }

        return $created;
    }

    /**
     * DELETE /api/v1/admin/products/{product}/images/{image}
     */
    public function deleteImage(Product $product, ProductImage $image): JsonResponse
    {
        $this->authorize('update', $product);

        abort_unless($image->product_id === $product->id, 404, 'GÃ¶rsel bu Ã¼rÃ¼ne ait deÄŸil.');

        Storage::disk('public')->delete($image->path);
        $wasCover = $image->is_cover;
        $image->delete();

        // Silinen gÃ¶rsel cover ise sÄ±radakini cover yap
        if ($wasCover) {
            $product->images()->oldest('sort_order')->first()?->update(['is_cover' => true]);
        }

        return $this->noContent();
    }

    // â”€â”€ VARYANT YÃ–NETÄ°MÄ° â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * POST /api/v1/admin/products/{product}/variants
     *
     * ÃœrÃ¼ne yeni varyant ekle.
     * Request body:
     *   name            â€” string  (Renk, Beden vb.)
     *   value           â€” string  (KÄ±rmÄ±zÄ±, XL vb.)
     *   price_modifier  â€” decimal (+ veya -)
     *   stock           â€” integer
     *   sku             â€” string|null
     */
    public function storeVariant(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $data = $request->validate([
            'name'           => ['required', 'string', 'max:50'],
            'value'          => ['required', 'string', 'max:100'],
            'price_modifier' => ['numeric'],
            'stock'          => ['required', 'integer', 'min:0'],
            'sku'            => ['nullable', 'string', 'max:100', 'unique:product_variants,sku'],
            'is_active'      => ['boolean'],
        ]);

        $variant = $product->variants()->create($data);  // tÃ¼m varyantlar (aktif deÄŸil)

        return $this->created(
            new ProductVariantResource($variant->setRelation('product', $product)),
            'Varyant eklendi.'
        );
    }

    /**
     * PUT /api/v1/admin/products/{product}/variants/{variant}
     */
    public function updateVariant(Request $request, Product $product, ProductVariant $variant): JsonResponse
    {
        $this->authorize('update', $product);

        abort_unless($variant->product_id === $product->id, 404, 'Varyant bu urune ait degil.');

        $data = $request->validate([
            'name'           => ['sometimes', 'required', 'string', 'max:50'],
            'value'          => ['sometimes', 'required', 'string', 'max:100'],
            'price_modifier' => ['sometimes', 'numeric'],
            'stock'          => ['sometimes', 'integer', 'min:0'],
            'sku'            => ['nullable', 'string', 'max:100', 'unique:product_variants,sku,' . $variant->id],
            'is_active'      => ['sometimes', 'boolean'],
        ]);

        $variant->update($data);

        return $this->success(
            new ProductVariantResource($variant->fresh()->setRelation('product', $product)),
            'Varyant guncellendi.'
        );
    }

    /**
     * PUT /api/v1/admin/products/{product}/variants/{variant}/option-values
     */
    public function syncVariantOptionValues(
        Request $request,
        Product $product,
        ProductVariant $variant
    ): JsonResponse {
        $this->authorize('update', $product);
        abort_unless($variant->product_id === $product->id, 404, 'Varyant bu urune ait degil.');

        $data = $request->validate([
            'option_value_ids' => ['required', 'array', 'min:1'],
            'option_value_ids.*' => ['integer', 'exists:product_option_values,id'],
        ]);

        $validOptionValueIds = ProductOptionValue::query()
            ->whereIn('id', $data['option_value_ids'])
            ->whereHas('axis', fn ($query) => $query->where('product_id', $product->id))
            ->pluck('id')
            ->all();

        if (count($validOptionValueIds) !== count($data['option_value_ids'])) {
            return $this->error('Secilen option value id urune ait degil.', 422);
        }

        $variant->optionValues()->sync($validOptionValueIds);

        return $this->success(
            new ProductVariantResource($variant->fresh('optionValues')->setRelation('product', $product)),
            'Varyant option degerleri guncellendi.'
        );
    }

    /**
     * DELETE /api/v1/admin/products/{product}/variants/{variant}
     */
    public function destroyVariant(Product $product, ProductVariant $variant): JsonResponse
    {
        $this->authorize('update', $product);

        abort_unless($variant->product_id === $product->id, 404, 'Varyant bu Ã¼rÃ¼ne ait deÄŸil.');

        $variant->delete();

        return $this->noContent();
    }

    /**
     * POST /api/v1/admin/products/{product}/option-axes
     */
    public function storeOptionAxis(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $data = $request->validate([
            'code' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('product_option_axes', 'code')->where(
                    fn ($query) => $query->where('product_id', $product->id)
                ),
            ],
            'name' => ['required', 'string', 'max:80'],
            'type' => ['nullable', 'string', 'max:20'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_required' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        $axis = $product->optionAxes()->create($data);

        return $this->created(
            ['axis' => $axis->load('values')],
            'Secenek ekseni eklendi.'
        );
    }

    /**
     * PUT /api/v1/admin/products/{product}/option-axes/{axis}
     */
    public function updateOptionAxis(Request $request, Product $product, ProductOptionAxis $axis): JsonResponse
    {
        $this->authorize('update', $product);
        abort_unless($axis->product_id === $product->id, 404, 'Secenek ekseni bu urune ait degil.');

        $data = $request->validate([
            'code' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('product_option_axes', 'code')
                    ->ignore($axis->id)
                    ->where(fn ($query) => $query->where('product_id', $product->id)),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:80'],
            'type' => ['sometimes', 'nullable', 'string', 'max:20'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_required' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $axis->update($data);

        return $this->success(
            ['axis' => $axis->fresh()->load('values')],
            'Secenek ekseni guncellendi.'
        );
    }

    /**
     * DELETE /api/v1/admin/products/{product}/option-axes/{axis}
     */
    public function destroyOptionAxis(Product $product, ProductOptionAxis $axis): JsonResponse
    {
        $this->authorize('update', $product);
        abort_unless($axis->product_id === $product->id, 404, 'Secenek ekseni bu urune ait degil.');

        $axis->delete();

        return $this->noContent();
    }

    /**
     * POST /api/v1/admin/products/{product}/option-axes/{axis}/values
     */
    public function storeOptionValue(Request $request, Product $product, ProductOptionAxis $axis): JsonResponse
    {
        $this->authorize('update', $product);
        abort_unless($axis->product_id === $product->id, 404, 'Secenek ekseni bu urune ait degil.');

        $data = $request->validate([
            'value' => [
                'required',
                'string',
                'max:120',
                Rule::unique('product_option_values', 'value')->where(
                    fn ($query) => $query->where('axis_id', $axis->id)
                ),
            ],
            'label' => ['nullable', 'string', 'max:120'],
            'hex_color' => ['nullable', 'string', 'max:16'],
            'numeric_value' => ['nullable', 'numeric'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $value = $axis->values()->create($data);

        return $this->created(
            ['value' => $value],
            'Secenek degeri eklendi.'
        );
    }

    /**
     * PUT /api/v1/admin/products/{product}/option-axes/{axis}/values/{value}
     */
    public function updateOptionValue(
        Request $request,
        Product $product,
        ProductOptionAxis $axis,
        ProductOptionValue $value
    ): JsonResponse {
        $this->authorize('update', $product);
        abort_unless($axis->product_id === $product->id, 404, 'Secenek ekseni bu urune ait degil.');
        abort_unless($value->axis_id === $axis->id, 404, 'Secenek degeri bu eksene ait degil.');

        $data = $request->validate([
            'value' => [
                'sometimes',
                'required',
                'string',
                'max:120',
                Rule::unique('product_option_values', 'value')
                    ->ignore($value->id)
                    ->where(fn ($query) => $query->where('axis_id', $axis->id)),
            ],
            'label' => ['sometimes', 'nullable', 'string', 'max:120'],
            'hex_color' => ['sometimes', 'nullable', 'string', 'max:16'],
            'numeric_value' => ['sometimes', 'nullable', 'numeric'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $value->update($data);

        return $this->success(
            ['value' => $value->fresh()],
            'Secenek degeri guncellendi.'
        );
    }

    /**
     * DELETE /api/v1/admin/products/{product}/option-axes/{axis}/values/{value}
     */
    public function destroyOptionValue(
        Product $product,
        ProductOptionAxis $axis,
        ProductOptionValue $value
    ): JsonResponse {
        $this->authorize('update', $product);
        abort_unless($axis->product_id === $product->id, 404, 'Secenek ekseni bu urune ait degil.');
        abort_unless($value->axis_id === $axis->id, 404, 'Secenek degeri bu eksene ait degil.');

        $value->delete();

        return $this->noContent();
    }
}

