<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media_time_rules', function (Blueprint $table) {
            $table->decimal('base_minutes_per_correct', 4, 2)->default(0.50)->after('min_learn_for_unlock');
            $table->decimal('multiplier_multiple_choice', 3, 2)->default(1.00)->after('base_minutes_per_correct');
            $table->decimal('multiplier_free_text', 3, 2)->default(1.50)->after('multiplier_multiple_choice');
            $table->decimal('multiplier_dictation', 3, 2)->default(2.00)->after('multiplier_free_text');
            $table->decimal('gaming_exchange_rate', 3, 2)->default(1.50)->after('multiplier_dictation');
            $table->decimal('youtube_exchange_rate', 3, 2)->default(1.00)->after('gaming_exchange_rate');
            $table->unsignedInteger('streak_bonus_days')->default(7)->after('youtube_exchange_rate');
            $table->unsignedInteger('streak_bonus_minutes')->default(15)->after('streak_bonus_days');
        });
    }

    public function down(): void
    {
        Schema::table('media_time_rules', function (Blueprint $table) {
            $table->dropColumn([
                'base_minutes_per_correct',
                'multiplier_multiple_choice',
                'multiplier_free_text',
                'multiplier_dictation',
                'gaming_exchange_rate',
                'youtube_exchange_rate',
                'streak_bonus_days',
                'streak_bonus_minutes',
            ]);
        });
    }
};
