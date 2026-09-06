<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('reviews', 'title')) {
                $table->string('title', 150)->nullable()->after('rating');
            }
            if (! Schema::hasColumn('reviews', 'admin_note')) {
                $table->string('admin_note', 300)->nullable()->after('comment');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'title')) {
                $table->dropColumn('title');
            }
            if (Schema::hasColumn('reviews', 'admin_note')) {
                $table->dropColumn('admin_note');
            }
        });
    }
};
