<?php

namespace App\Models;

use App\Enums\LanguagePair;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Child extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'username',
        'pin',
        'language_pair',
        'media_time_balance_gaming',
        'media_time_balance_youtube',
        'is_active',
    ];

    protected $hidden = ['pin'];

    protected function casts(): array
    {
        return [
            'language_pair'                => LanguagePair::class,
            'media_time_balance_gaming'    => 'integer',
            'media_time_balance_youtube'   => 'integer',
            'is_active'                    => 'boolean',
            'pin'                          => 'hashed',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function flashCards(): HasMany
    {
        return $this->hasMany(FlashCard::class);
    }

    public function trainingSessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }

    public function mediaTimeLogs(): HasMany
    {
        return $this->hasMany(MediaTimeLog::class);
    }
}
