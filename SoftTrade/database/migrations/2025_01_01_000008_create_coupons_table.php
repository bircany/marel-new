<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('type', 10)->default('fixed');
            $table->decimal('amount', 10, 2);
            $table->decimal('min_order', 10, 2)->default(0);
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('expires_at')->nullable();
            $table->timestampsTz();
        });

        DB::statement("ALTER TABLE coupons ADD CONSTRAINT chk_coupon_type
            CHECK (type IN ('fixed','percent'))");

        DB::statement("ALTER TABLE coupons ADD CONSTRAINT chk_coupon_percent
            CHECK (type <> 'percent' OR amount <= 100)");
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
