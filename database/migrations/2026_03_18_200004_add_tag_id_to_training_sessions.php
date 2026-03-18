<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            $table->foreignId('tag_id')
                ->nullable()
                ->after('language_pair')
                ->constrained('tags')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Tag::class);
            $table->dropColumn('tag_id');
        });
    }
};
