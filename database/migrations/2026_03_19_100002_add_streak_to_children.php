<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->unsignedInteger('current_streak')->default(0)->after('media_time_balance_youtube');
            $table->date('last_trained_date')->nullable()->after('current_streak');
        });
    }

    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropColumn(['current_streak', 'last_trained_date']);
        });
    }
};
