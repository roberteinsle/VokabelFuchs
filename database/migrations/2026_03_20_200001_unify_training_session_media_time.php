<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            $table->unsignedInteger('media_time_earned')->default(0)->after('cards_wrong');
        });

        DB::table('training_sessions')->update([
            'media_time_earned' => DB::raw('media_time_earned_gaming + media_time_earned_youtube'),
        ]);

        Schema::table('training_sessions', function (Blueprint $table) {
            $table->dropColumn(['media_time_earned_gaming', 'media_time_earned_youtube']);
        });
    }

    public function down(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            $table->unsignedInteger('media_time_earned_gaming')->default(0);
            $table->unsignedInteger('media_time_earned_youtube')->default(0);
        });

        DB::table('training_sessions')->update([
            'media_time_earned_gaming' => DB::raw('media_time_earned'),
        ]);

        Schema::table('training_sessions', function (Blueprint $table) {
            $table->dropColumn('media_time_earned');
        });
    }
};
