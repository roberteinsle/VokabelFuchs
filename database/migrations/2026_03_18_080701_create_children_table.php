<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('pin'); // bcrypt hashed 4-digit PIN
            $table->string('language_pair')->default('de_en'); // LanguagePair enum
            $table->unsignedInteger('media_time_balance_gaming')->default(0); // minutes
            $table->unsignedInteger('media_time_balance_youtube')->default(0); // minutes
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
