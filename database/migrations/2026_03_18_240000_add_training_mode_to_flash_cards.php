<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('flash_cards', function (Blueprint $table) {
            $table->string('training_mode')->default('multiple_choice')->after('child_id');
            $table->dropUnique(['vocabulary_id', 'child_id']);
            $table->unique(['vocabulary_id', 'child_id', 'training_mode']);
        });
    }

    public function down(): void
    {
        Schema::table('flash_cards', function (Blueprint $table) {
            $table->dropUnique(['vocabulary_id', 'child_id', 'training_mode']);
            $table->dropColumn('training_mode');
            $table->unique(['vocabulary_id', 'child_id']);
        });
    }
};
