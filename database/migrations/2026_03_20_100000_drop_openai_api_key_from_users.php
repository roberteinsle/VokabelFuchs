<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'openai_api_key')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('openai_api_key');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('openai_api_key')->nullable();
        });
    }
};
