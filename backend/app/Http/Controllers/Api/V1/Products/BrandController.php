<?php

namespace App\Http\Controllers\Api\V1\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Brand\StoreBrandRequest;
use App\Http\Requests\Api\V1\Brand\UpdateBrandRequest;
use App\Http\Resources\Api\V1\BrandResource;
use App\Models\Brand;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BrandController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/brands
     * Tüm aktif markaları döner.
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Brand::class);

        $brands = Brand::active()->orderBy('name')->get();

        return $this->success(BrandResource::collection($brands));
    }

    /**
     * GET /api/v1/brands/{brand}
     */
    public function show(Brand $brand): JsonResponse
    {
        $this->authorize('view', $brand);

        return $this->success(new BrandResource($brand));
    }

    /**
     * POST /api/v1/admin/brands
     * Marka oluştur. Logo varsa storage/public/brands'e yükler.
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $this->authorize('create', Brand::class);

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')
                ->store('brands', 'public');
        }

        $brand = Brand::create($data);

        return $this->created(new BrandResource($brand), 'Marka başarıyla oluşturuldu.');
    }

    /**
     * PUT /api/v1/admin/brands/{brand}
     * Markayı güncelle. Yeni logo gelirse eskisini sil.
     */
    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $this->authorize('update', $brand);

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }
            $data['logo'] = $request->file('logo')
                ->store('brands', 'public');
        }

        if ($request->has('remove_logo') && $request->boolean('remove_logo')) {
            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }
            $data['logo'] = null;
        }

        $brand->update($data);

        return $this->success(new BrandResource($brand->fresh()), 'Marka güncellendi.');
    }

    /**
     * DELETE /api/v1/admin/brands/{brand}
     * Markayı ve logosunu siler.
     */
    public function destroy(Brand $brand): JsonResponse
    {
        $this->authorize('delete', $brand);

        if ($brand->logo) {
            Storage::disk('public')->delete($brand->logo);
        }

        $brand->delete();

        return $this->noContent();
    }
}
