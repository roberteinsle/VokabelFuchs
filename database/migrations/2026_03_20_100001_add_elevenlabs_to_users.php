<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('elevenlabs_api_key')->nullable()->after('pin');
        });

        Schema::create('elevenlabs_voices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->string('language', 10); // e.g. 'en', 'de', 'fr'
            $table->string('voice_id');
            $table->string('voice_name');
            $table->timestamps();

            $table->unique(['parent_id', 'language']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('elevenlabs_voices');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('elevenlabs_api_key');
        });
    }
};
