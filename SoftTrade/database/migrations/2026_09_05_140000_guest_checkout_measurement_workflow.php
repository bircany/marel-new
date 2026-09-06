<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('guest_email', 150)->nullable()->after('user_id');
            $table->string('guest_phone', 30)->nullable()->after('guest_email');
            $table->string('guest_name', 150)->nullable()->after('guest_phone');
            $table->timestampTz('measurement_confirmed_at')->nullable()->after('admin_notes');
            $table->text('measurement_notes')->nullable()->after('measurement_confirmed_at');
            $table->index('guest_email');
        });

        // user_id misafir sipariş için nullable
        DB::statement('ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL');

        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_order_status');
        DB::statement("ALTER TABLE orders ADD CONSTRAINT chk_order_status
            CHECK (status IN (
                'pending',
                'awaiting_measurement',
                'measure_ok',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded'
            ))");

        // Ödeme / WhatsApp / IBAN ayarları
        DB::table('site_settings')->updateOrInsert(
            ['key' => 'payment'],
            [
                'value' => json_encode([
                    'iban' => 'TR00 0000 0000 0000 0000 0000 00',
                    'bank_name' => 'Marel Havale Hesabı',
                    'account_holder' => 'Marel',
                    'whatsapp_phone' => '905467356602',
                    'payment_note' => 'Açıklamaya sipariş numaranızı yazın. Ödeme dekontunu WhatsApp üzerinden iletin.',
                    'free_shipping_min' => 1000,
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('site_settings')->where('key', 'payment')->delete();

        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_order_status');
        DB::statement("ALTER TABLE orders ADD CONSTRAINT chk_order_status
            CHECK (status IN ('pending','processing','shipped','delivered','cancelled','refunded'))");

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'guest_email',
                'guest_phone',
                'guest_name',
                'measurement_confirmed_at',
                'measurement_notes',
            ]);
        });
    }
};
