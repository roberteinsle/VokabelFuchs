<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingResult extends Model
{
    protected $fillable = [
        'training_session_id',
        'flash_card_id',
        'was_correct',
        'answer_given',
        'drawer_before',
        'drawer_after',
    ];

    protected function casts(): array
    {
        return [
            'was_correct' => 'boolean',
            'drawer_before' => 'integer',
            'drawer_after' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class, 'training_session_id');
    }

    public function flashCard(): BelongsTo
    {
        return $this->belongsTo(FlashCard::class);
    }
}
