<?php

namespace App\Models;

use App\Enums\LanguagePair;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'pin',
        'language_pair',
        'media_time_balance',
        'is_active',
        'current_streak',
        'last_trained_date',
    ];

    protected $hidden = ['pin'];

    protected function casts(): array
    {
        return [
            'language_pair' => LanguagePair::class,
            'media_time_balance' => 'integer',
            'is_active' => 'boolean',
            'pin' => 'hashed',
            'current_streak' => 'integer',
            'last_trained_date' => 'date',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'child_tag');
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
