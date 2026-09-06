<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 80);
            $table->string('name', 150);
            $table->string('phone', 20);
            $table->string('city', 80);
            $table->string('district', 80);
            $table->string('neighborhood', 100)->nullable();
            $table->text('full_address');
            $table->string('zip_code', 10)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestampsTz();

            $table->index(['user_id', 'is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
