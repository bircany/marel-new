<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->jsonb('shipping_address');
            $table->jsonb('billing_address')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('status', 20)->default('pending');
            $table->string('payment_status', 20)->default('pending');
            $table->string('payment_method', 30)->nullable();
            $table->string('cargo_company', 50)->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->timestampTz('shipped_at')->nullable();
            $table->timestampTz('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestampsTz();

            $table->index('status');
            $table->index('payment_status');
            $table->index('user_id');
        });

        DB::statement("ALTER TABLE orders ADD CONSTRAINT chk_order_status
            CHECK (status IN ('pending','processing','shipped','delivered','cancelled','refunded'))");

        DB::statement("ALTER TABLE orders ADD CONSTRAINT chk_payment_status
            CHECK (payment_status IN ('pending','paid','failed','refunded'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
