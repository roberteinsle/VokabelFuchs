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
        Schema::create('training_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('flash_card_id')->constrained()->cascadeOnDelete();
            $table->boolean('was_correct');
            $table->string('answer_given')->nullable();
            $table->tinyInteger('drawer_before');
            $table->tinyInteger('drawer_after');
            $table->timestamps();

            $table->index('training_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_results');
    }
};
