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
    ];

    protected function casts(): array
    {
        return [
            'minutes_learn_per_gaming'   => 'integer',
            'minutes_gaming_per_learn'   => 'integer',
            'minutes_learn_per_youtube'  => 'integer',
            'minutes_youtube_per_learn'  => 'integer',
            'daily_cap_gaming'           => 'integer',
            'daily_cap_youtube'          => 'integer',
            'min_learn_for_unlock'       => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}
