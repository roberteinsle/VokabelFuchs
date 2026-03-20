<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElevenLabsVoice extends Model
{
    protected $table = 'elevenlabs_voices';

    protected $fillable = ['parent_id', 'language', 'voice_id', 'voice_name'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}
