<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->unsignedInteger('media_time_balance')->default(0)->after('is_active');
        });

        // Merge existing balances into single field
        DB::table('children')->update([
            'media_time_balance' => DB::raw('media_time_balance_gaming + media_time_balance_youtube'),
        ]);

        Schema::table('children', function (Blueprint $table) {
            $table->dropColumn(['media_time_balance_gaming', 'media_time_balance_youtube']);
        });

        // Remove exchange rates from rules (no longer needed)
        Schema::table('media_time_rules', function (Blueprint $table) {
            $table->dropColumn(['gaming_exchange_rate', 'youtube_exchange_rate']);
        });
    }

    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->unsignedInteger('media_time_balance_gaming')->default(0);
            $table->unsignedInteger('media_time_balance_youtube')->default(0);
        });

        DB::table('children')->update([
            'media_time_balance_gaming' => DB::raw('media_time_balance'),
        ]);

        Schema::table('children', function (Blueprint $table) {
            $table->dropColumn('media_time_balance');
        });

        Schema::table('media_time_rules', function (Blueprint $table) {
            $table->decimal('gaming_exchange_rate', 3, 2)->default(1.50);
            $table->decimal('youtube_exchange_rate', 3, 2)->default(1.00);
        });
    }
};
