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
        Schema::create('media_time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('training_session_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');   // MediaTimeType enum: gaming|youtube
            $table->string('action'); // MediaTimeAction enum: earned|spent
            $table->integer('minutes');
            $table->integer('balance_after'); // balance snapshot after this transaction
            $table->string('note')->nullable();
            $table->timestamps();

            $table->index(['child_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_time_logs');
    }
};
