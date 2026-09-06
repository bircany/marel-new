<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('session_id', 100)->nullable();   // misafir sepeti için UUID
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->timestampsTz();

            $table->unique(['user_id', 'product_id', 'variant_id']);
            $table->index('session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
