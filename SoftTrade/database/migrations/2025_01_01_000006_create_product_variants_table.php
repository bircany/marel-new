<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('name', 50);
            $table->string('value', 100);
            $table->decimal('price_modifier', 10, 2)->default(0.00);
            $table->unsignedInteger('stock')->default(0);
            $table->string('sku', 100)->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index(['product_id', 'name', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
