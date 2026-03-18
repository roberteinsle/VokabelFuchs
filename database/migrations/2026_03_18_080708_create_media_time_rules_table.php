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
        Schema::create('media_time_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('minutes_learn_per_gaming')->default(10);   // 10 min learn = 15 min gaming
            $table->unsignedInteger('minutes_gaming_per_learn')->default(15);
            $table->unsignedInteger('minutes_learn_per_youtube')->default(10);  // 10 min learn = 10 min youtube
            $table->unsignedInteger('minutes_youtube_per_learn')->default(10);
            $table->unsignedInteger('daily_cap_gaming')->default(60);   // max minutes per day
            $table->unsignedInteger('daily_cap_youtube')->default(45);
            $table->unsignedInteger('min_learn_for_unlock')->default(5); // minimum minutes to unlock any time
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_time_rules');
    }
};
