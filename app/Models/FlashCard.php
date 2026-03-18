<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlashCard extends Model
{
    protected $fillable = [
        'vocabulary_id',
        'child_id',
        'training_mode',
        'drawer',
        'next_review_date',
        'streak_count',
        'last_reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'drawer'           => 'integer',
            'streak_count'     => 'integer',
            'next_review_date' => 'date',
            'last_reviewed_at' => 'datetime',
        ];
    }

    public function vocabulary(): BelongsTo
    {
        return $this->belongsTo(Vocabulary::class);
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function trainingResults(): HasMany
    {
        return $this->hasMany(TrainingResult::class);
    }

    public function isDue(): bool
    {
        return $this->next_review_date->isPast() || $this->next_review_date->isToday();
    }
}
