<?php

namespace App\Models;

use App\Enums\LanguagePair;
use App\Enums\TrainingMode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingSession extends Model
{
    protected $fillable = [
        'child_id',
        'language_pair',
        'training_mode',
        'tag_id',
        'direction',
        'started_at',
        'ended_at',
        'cards_correct',
        'cards_wrong',
        'media_time_earned_gaming',
        'media_time_earned_youtube',
    ];

    protected function casts(): array
    {
        return [
            'language_pair' => LanguagePair::class,
            'training_mode' => TrainingMode::class,
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'cards_correct' => 'integer',
            'cards_wrong' => 'integer',
            'media_time_earned_gaming' => 'integer',
            'media_time_earned_youtube' => 'integer',
        ];
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(TrainingResult::class);
    }

    public function getDurationMinutes(): int
    {
        if (! $this->ended_at) {
            return 0;
        }

        return (int) $this->started_at->diffInMinutes($this->ended_at);
    }

    public function isFinished(): bool
    {
        return $this->ended_at !== null;
    }
}
