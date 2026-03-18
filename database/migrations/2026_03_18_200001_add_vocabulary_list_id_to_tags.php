<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->foreignId('vocabulary_list_id')
                ->nullable()
                ->after('parent_id')
                ->constrained('vocabulary_lists')
                ->cascadeOnDelete();

            $table->dropUnique(['parent_id', 'name']);
        });

        // Make NOT NULL after adding (no existing rows to worry about in dev)
        Schema::table('tags', function (Blueprint $table) {
            $table->unique(['vocabulary_list_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropUnique(['vocabulary_list_id', 'name']);
            $table->dropForeignIdFor(\App\Models\VocabularyList::class);
            $table->dropColumn('vocabulary_list_id');
            $table->unique(['parent_id', 'name']);
        });
    }
};
