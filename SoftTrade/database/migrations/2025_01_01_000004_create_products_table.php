<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->string('name', 250);
            $table->string('slug', 280)->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->string('sku', 100)->nullable()->unique();
            $table->string('status', 10)->default('active');
            $table->jsonb('attributes')->nullable();
            $table->decimal('weight', 8, 3)->nullable();
            $table->unsignedBigInteger('view_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestampsTz();

            $table->index('status');
            $table->index('price');
            $table->index('is_featured');
        });

        DB::statement("ALTER TABLE products ADD CONSTRAINT chk_product_status
            CHECK (status IN ('active','inactive','draft'))");

        DB::statement("CREATE INDEX products_name_fts_idx
            ON products USING gin(to_tsvector('turkish', name))");
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
