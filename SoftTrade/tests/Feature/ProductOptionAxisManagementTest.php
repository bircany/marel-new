<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductOptionAxis;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Middleware\RoleMiddleware;
use Tests\TestCase;

class ProductOptionAxisManagementTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-axis@example.com',
            'phone' => null,
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);
    }

    #[Test]
    public function admin_can_crud_option_axes_and_values(): void
    {
        $this->withoutMiddleware([RoleMiddleware::class]);

        $admin = $this->adminUser();
        $product = Product::factory()->create();

        $axisResponse = $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/products/{$product->id}/option-axes", [
            'code' => 'color',
            'name' => 'Renk',
            'type' => 'color',
            'sort_order' => 1,
            'is_required' => true,
            'is_active' => true,
        ]);

        $axisResponse->assertCreated();
        $axisId = (int) $axisResponse->json('data.axis.id');

        $this->assertDatabaseHas('product_option_axes', [
            'id' => $axisId,
            'product_id' => $product->id,
            'code' => 'color',
            'name' => 'Renk',
        ]);

        $updateAxis = $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/products/{$product->id}/option-axes/{$axisId}", [
            'name' => 'Renk Secimi',
            'is_required' => false,
        ]);
        $updateAxis->assertOk();

        $this->assertDatabaseHas('product_option_axes', [
            'id' => $axisId,
            'name' => 'Renk Secimi',
            'is_required' => false,
        ]);

        $valueResponse = $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/products/{$product->id}/option-axes/{$axisId}/values", [
            'value' => 'blue',
            'label' => 'Mavi',
            'hex_color' => '#0000FF',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $valueResponse->assertCreated();

        $valueId = (int) $valueResponse->json('data.value.id');
        $this->assertDatabaseHas('product_option_values', [
            'id' => $valueId,
            'axis_id' => $axisId,
            'value' => 'blue',
        ]);

        $updateValue = $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/products/{$product->id}/option-axes/{$axisId}/values/{$valueId}", [
            'label' => 'Koyu Mavi',
            'is_active' => false,
        ]);
        $updateValue->assertOk();

        $this->assertDatabaseHas('product_option_values', [
            'id' => $valueId,
            'label' => 'Koyu Mavi',
            'is_active' => false,
        ]);

        $deleteValue = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/admin/products/{$product->id}/option-axes/{$axisId}/values/{$valueId}");
        $deleteValue->assertNoContent();
        $this->assertDatabaseMissing('product_option_values', ['id' => $valueId]);

        $deleteAxis = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/admin/products/{$product->id}/option-axes/{$axisId}");
        $deleteAxis->assertNoContent();
        $this->assertDatabaseMissing('product_option_axes', ['id' => $axisId]);
    }

    #[Test]
    public function axis_and_value_scope_validation_prevents_cross_product_operations(): void
    {
        $this->withoutMiddleware([RoleMiddleware::class]);

        $admin = $this->adminUser();
        $productA = Product::factory()->create();
        $productB = Product::factory()->create();

        $axis = ProductOptionAxis::query()->create([
            'product_id' => $productA->id,
            'code' => 'size',
            'name' => 'Olcu',
            'type' => 'text',
            'sort_order' => 1,
            'is_required' => true,
            'is_active' => true,
        ]);

        $value = ProductOptionValue::query()->create([
            'axis_id' => $axis->id,
            'value' => '100x200',
            'label' => '100x200',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $updateAxisWrongProduct = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/products/{$productB->id}/option-axes/{$axis->id}", [
                'name' => 'Yanlis',
            ]);
        $updateAxisWrongProduct->assertStatus(404);

        $updateValueWrongProduct = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/products/{$productB->id}/option-axes/{$axis->id}/values/{$value->id}", [
                'label' => 'Yanlis',
            ]);
        $updateValueWrongProduct->assertStatus(404);
    }

    #[Test]
    public function admin_can_sync_option_values_to_variant(): void
    {
        $this->withoutMiddleware([RoleMiddleware::class]);

        $admin = $this->adminUser();
        $product = Product::factory()->create();

        $axis = ProductOptionAxis::query()->create([
            'product_id' => $product->id,
            'code' => 'color',
            'name' => 'Renk',
            'type' => 'color',
            'sort_order' => 1,
            'is_required' => true,
            'is_active' => true,
        ]);

        $value = ProductOptionValue::query()->create([
            'axis_id' => $axis->id,
            'value' => 'red',
            'label' => 'Kirmizi',
            'hex_color' => '#ff0000',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $variant = ProductVariant::query()->create([
            'product_id' => $product->id,
            'name' => 'Kombinasyon',
            'value' => 'Renk: Kirmizi',
            'price_modifier' => 0,
            'stock' => 10,
            'sku' => null,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/products/{$product->id}/variants/{$variant->id}/option-values", [
                'option_value_ids' => [$value->id],
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('product_variant_option_values', [
            'variant_id' => $variant->id,
            'option_value_id' => $value->id,
        ]);
    }
}
