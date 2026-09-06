<?php

namespace App\Http\Controllers\Api\V1\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Category\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Category\UpdateCategoryRequest;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/categories
     *
     * Nested tree yapısında tüm aktif kategorileri döner.
     * Örnek response:
     * [
     *   { id:1, name:"Elektronik", children: [
     *     { id:3, name:"Telefon", children: [...] }
     *   ]},
     *   { id:2, name:"Giyim", children: [...] }
     * ]
     */
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::with('allChildren')  // recursive eager load
            ->active()
            ->root()               // sadece parent_id = null olan kökler
            ->ordered()
            ->get();

        return $this->success(CategoryResource::collection($categories));
    }

    /**
     * GET /api/v1/categories/{category}
     * Tek kategori + alt kategorileri döner.
     */
    public function show(Category $category): JsonResponse
    {
        $this->authorize('view', $category);

        $category->load('allChildren', 'parent');

        return $this->success(new CategoryResource($category));
    }

    /**
     * POST /api/v1/admin/categories
     * Yeni kategori oluştur. Görsel varsa storage/public/categories'e yükler.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')
                ->store('categories', 'public');   // storage/app/public/categories/
        }

        $category = Category::create($data);

        return $this->created(
            new CategoryResource($category),
            'Kategori başarıyla oluşturuldu.'
        );
    }

    /**
     * PUT /api/v1/admin/categories/{category}
     * Kategoriyi güncelle. Yeni görsel gelirse eskisini sil.
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $this->authorize('update', $category);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Eski görseli sil
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')
                ->store('categories', 'public');
        }

        // Görseli açıkça null gönderdiyse sil
        if ($request->has('remove_image') && $request->boolean('remove_image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = null;
        }

        $category->update($data);

        return $this->success(
            new CategoryResource($category->fresh('allChildren')),
            'Kategori güncellendi.'
        );
    }

    /**
     * DELETE /api/v1/admin/categories/{category}
     * Kategoriyi ve görselini siler. Alt kategorilerin parent_id'si NULL olur (nullOnDelete).
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return $this->noContent();
    }
}
