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
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->string('language_pair'); // LanguagePair enum
            $table->string('training_mode'); // TrainingMode enum
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('cards_correct')->default(0);
            $table->unsignedInteger('cards_wrong')->default(0);
            $table->unsignedInteger('media_time_earned_gaming')->default(0); // minutes
            $table->unsignedInteger('media_time_earned_youtube')->default(0); // minutes
            $table->timestamps();

            $table->index(['child_id', 'started_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};
