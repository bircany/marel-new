<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->string('status', 15)->default('pending');
            $table->boolean('is_verified_purchase')->default(false);
            $table->timestampsTz();

            $table->unique(['user_id', 'product_id']);
            $table->index(['product_id', 'status']);
        });

        DB::statement("ALTER TABLE reviews ADD CONSTRAINT chk_rating
            CHECK (rating BETWEEN 1 AND 5)");

        DB::statement("ALTER TABLE reviews ADD CONSTRAINT chk_review_status
            CHECK (status IN ('pending','approved','rejected'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
