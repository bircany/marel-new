<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kupon tablosuna yüzde kuponu maksimum indirim tutarı sınırı ekler.
 * Örnek: %30 kupon, max 200 TL indirim yapabilir.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            // Yüzde tipi kuponlarda indirim tavan değeri (NULL = sınırsız)
            $table->decimal('max_discount', 10, 2)
                  ->nullable()
                  ->after('amount')
                  ->comment('Yüzde kuponlar için maksimum indirim tutarı (TL)');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn('max_discount');
        });
    }
};
