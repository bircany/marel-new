<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_order_status');
        DB::statement("UPDATE orders SET status = 'measure_ok' WHERE status = 'measurement_confirmed'");
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
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_order_status');
        DB::statement("UPDATE orders SET status = 'measurement_confirmed' WHERE status = 'measure_ok'");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT chk_order_status
            CHECK (status IN (
                'pending',
                'awaiting_measurement',
                'measurement_confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded'
            ))");
    }
};
