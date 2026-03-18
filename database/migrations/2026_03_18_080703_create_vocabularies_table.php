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
        Schema::create('vocabularies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->string('word_de');
            $table->string('word_en')->nullable();
            $table->string('word_fr')->nullable();
            $table->text('sentence_de')->nullable();
            $table->text('sentence_en')->nullable();
            $table->text('sentence_fr')->nullable();
            $table->string('image_path')->nullable(); // Phase 2: DALL-E generated
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocabularies');
    }
};
