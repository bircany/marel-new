<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('measurement_mode', 20)->default('fixed');
            $table->string('stock_mode', 20)->default('product');
            $table->boolean('is_made_to_order')->default(false);
        });

        Schema::create('product_option_axes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('code', 40)->nullable();
            $table->string('name', 80);
            $table->string('type', 20)->default('text');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->unique(['product_id', 'code']);
            $table->index(['product_id', 'sort_order']);
        });

        Schema::create('product_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('axis_id')->constrained('product_option_axes')->cascadeOnDelete();
            $table->string('value', 120);
            $table->string('label', 120)->nullable();
            $table->string('hex_color', 16)->nullable();
            $table->decimal('numeric_value', 12, 4)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->unique(['axis_id', 'value']);
            $table->index(['axis_id', 'sort_order']);
        });

        Schema::create('product_variant_option_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->foreignId('option_value_id')->constrained('product_option_values')->cascadeOnDelete();
            $table->timestampsTz();

            $table->unique(['variant_id', 'option_value_id']);
            $table->index('option_value_id');
        });

        Schema::create('product_custom_measurement_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->cascadeOnDelete();
            $table->decimal('min_width', 8, 2)->nullable();
            $table->decimal('max_width', 8, 2)->nullable();
            $table->decimal('step_width', 8, 2)->nullable();
            $table->decimal('min_height', 8, 2)->nullable();
            $table->decimal('max_height', 8, 2)->nullable();
            $table->decimal('step_height', 8, 2)->nullable();
            $table->string('formula_type', 30)->default('area_m2');
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->decimal('base_price', 12, 2)->nullable();
            $table->decimal('min_billable_area', 10, 4)->nullable();
            $table->decimal('min_total_price', 12, 2)->nullable();
            $table->boolean('allow_decimal')->default(false);
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_custom_measurement_rules');
        Schema::dropIfExists('product_variant_option_values');
        Schema::dropIfExists('product_option_values');
        Schema::dropIfExists('product_option_axes');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'measurement_mode',
                'stock_mode',
                'is_made_to_order',
            ]);
        });
    }
};
