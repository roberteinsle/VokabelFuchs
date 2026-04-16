<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaTimeRule extends Model
{
    protected $fillable = [
        'parent_id',
        'minutes_learn_per_gaming',
        'minutes_gaming_per_learn',
        'minutes_learn_per_youtube',
        'minutes_youtube_per_learn',
        'daily_cap_gaming',
        'daily_cap_youtube',
        'min_learn_for_unlock',
        'base_minutes_per_correct',
        'multiplier_multiple_choice',
        'multiplier_free_text',
        'multiplier_dictation',
        'streak_bonus_days',
        'streak_bonus_minutes',
    ];

    protected function casts(): array
    {
        return [
            'minutes_learn_per_gaming' => 'integer',
            'minutes_gaming_per_learn' => 'integer',
            'minutes_learn_per_youtube' => 'integer',
            'minutes_youtube_per_learn' => 'integer',
            'daily_cap_gaming' => 'integer',
            'daily_cap_youtube' => 'integer',
            'min_learn_for_unlock' => 'integer',
            'base_minutes_per_correct' => 'decimal:2',
            'multiplier_multiple_choice' => 'decimal:2',
            'multiplier_free_text' => 'decimal:2',
            'multiplier_dictation' => 'decimal:2',
            'streak_bonus_days' => 'integer',
            'streak_bonus_minutes' => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}
