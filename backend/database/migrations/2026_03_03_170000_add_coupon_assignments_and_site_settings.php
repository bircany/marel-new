<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            if (!Schema::hasColumn('coupons', 'audience')) {
                $table->string('audience', 20)->default('public')->after('code');
                $table->index('audience');
            }
        });

        Schema::create('coupon_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained('coupons')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('assigned_at')->nullable();
            $table->timestampTz('expires_at')->nullable();
            $table->timestampsTz();

            $table->unique(['coupon_id', 'user_id']);
            $table->index(['user_id', 'is_active']);
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 120)->unique();
            $table->jsonb('value')->nullable();
            $table->timestampsTz();
        });

        Schema::create('site_pages', function (Blueprint $table) {
            $table->id();
            $table->string('key', 80)->unique();
            $table->string('title', 120);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
        });

        DB::table('site_pages')->insert([
            ['key' => 'home', 'title' => 'Anasayfa', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'products', 'title' => 'Urunler', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'cart', 'title' => 'Sepet', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'checkout', 'title' => 'Odeme', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'account', 'title' => 'Hesabim', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact', 'title' => 'Iletisim', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('site_settings')->insert([
            ['key' => 'homepage', 'value' => json_encode([
                'hero_title' => 'SoftTrade ile Guvenli Alisveris',
                'hero_subtitle' => 'Ihtiyaciniz olan urunleri hizli ve guvenli sekilde satin alin.',
                'show_advantages' => true,
            ]), 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'footer', 'value' => json_encode([
                'company_name' => 'SoftTrade',
                'footer_text' => 'Kaliteli urunler, hizli teslimat, guvenli odeme.',
                'copyright' => 'SoftTrade. Tum haklari saklidir.',
            ]), 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact', 'value' => json_encode([
                'phone' => '',
                'email' => '',
                'address' => '',
                'map_embed_url' => '',
                'instagram' => '',
                'facebook' => '',
                'x' => '',
                'youtube' => '',
            ]), 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_pages');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('coupon_user');

        Schema::table('coupons', function (Blueprint $table) {
            if (Schema::hasColumn('coupons', 'audience')) {
                $table->dropColumn('audience');
            }
        });
    }
};
