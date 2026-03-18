<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_tag', function (Blueprint $table) {
            $table->foreignId('child_id')->constrained('children')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->primary(['child_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_tag');
    }
};
