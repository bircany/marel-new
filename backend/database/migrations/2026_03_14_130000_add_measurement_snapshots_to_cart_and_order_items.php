<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('measurement_hash', 64)->default('');
            $table->jsonb('custom_measurements')->nullable();
            $table->jsonb('pricing_snapshot')->nullable();
            $table->decimal('unit_price_snapshot', 12, 2)->nullable();

            $table->dropUnique('cart_items_user_id_product_id_variant_id_unique');
            $table->unique(['user_id', 'product_id', 'variant_id', 'measurement_hash'], 'cart_items_user_product_variant_measurement_unique');
            $table->unique(['session_id', 'product_id', 'variant_id', 'measurement_hash'], 'cart_items_session_product_variant_measurement_unique');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('measurement_label', 120)->nullable()->after('variant_label');
            $table->jsonb('custom_measurements')->nullable()->after('measurement_label');
            $table->jsonb('pricing_snapshot')->nullable()->after('custom_measurements');
            $table->string('stock_source', 20)->nullable()->after('pricing_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'measurement_label',
                'custom_measurements',
                'pricing_snapshot',
                'stock_source',
            ]);
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropUnique('cart_items_user_product_variant_measurement_unique');
            $table->dropUnique('cart_items_session_product_variant_measurement_unique');
            $table->unique(['user_id', 'product_id', 'variant_id']);

            $table->dropColumn([
                'measurement_hash',
                'custom_measurements',
                'pricing_snapshot',
                'unit_price_snapshot',
            ]);
        });
    }
};
