<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Laravel varsayılan users tablosuna e-ticaret alanlarını ekle
            $table->string('first_name', 100)->after('id');
            $table->string('last_name', 100)->after('first_name');
            $table->string('phone', 20)->nullable()->unique()->after('email');
            $table->string('role', 10)->default('user')->after('phone');
            $table->boolean('is_active')->default(true)->after('role');
        });

        // name sütununu kaldır (first_name/last_name kullanıyoruz)
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
        });

        DB::statement("ALTER TABLE users ADD CONSTRAINT chk_user_role
            CHECK (role IN ('admin', 'user'))");
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'phone', 'role', 'is_active']);
            $table->string('name')->after('id');
        });

        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_user_role");
    }
};
