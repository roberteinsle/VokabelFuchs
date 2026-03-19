<?php

use App\Models\VocabularyList;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vocabularies', function (Blueprint $table) {
            $table->foreignId('vocabulary_list_id')
                ->nullable()
                ->after('parent_id')
                ->constrained('vocabulary_lists')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('vocabularies', function (Blueprint $table) {
            $table->dropForeignIdFor(VocabularyList::class);
            $table->dropColumn('vocabulary_list_id');
        });
    }
};
