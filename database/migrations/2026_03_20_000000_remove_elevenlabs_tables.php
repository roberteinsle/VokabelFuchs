<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('elevenlabs_voices');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'elevenlabs_api_key')) {
                $table->dropColumn('elevenlabs_api_key');
            }
            if (Schema::hasColumn('users', 'google_tts_model')) {
                $table->dropColumn('google_tts_model');
            }
            if (Schema::hasColumn('users', 'google_tts_voice')) {
                $table->dropColumn('google_tts_voice');
            }
            if (! Schema::hasColumn('users', 'google_tts_api_key')) {
                $table->text('google_tts_api_key')->nullable()->after('pin');
            }
            if (! Schema::hasColumn('users', 'google_tts_voices')) {
                $table->json('google_tts_voices')->nullable()->after('google_tts_api_key');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_tts_api_key', 'google_tts_voices']);
            $table->text('elevenlabs_api_key')->nullable()->after('pin');
        });

        Schema::create('elevenlabs_voices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->string('language', 10);
            $table->string('voice_id');
            $table->string('voice_name');
            $table->timestamps();
            $table->unique(['parent_id', 'language']);
        });
    }
};
