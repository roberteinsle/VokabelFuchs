<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'pin', 'google_tts_api_key', 'google_tts_voices', 'image_prompt'])]
#[Hidden(['password', 'remember_token', 'google_tts_api_key'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'pin' => 'hashed',
            'google_tts_voices' => 'array',
        ];
    }

    public function hasPin(): bool
    {
        return $this->pin !== null;
    }

    public function children(): HasMany
    {
        return $this->hasMany(Child::class, 'parent_id');
    }

    public function vocabularies(): HasMany
    {
        return $this->hasMany(Vocabulary::class, 'parent_id');
    }

    public function vocabularyLists(): HasMany
    {
        return $this->hasMany(VocabularyList::class, 'parent_id');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class, 'parent_id');
    }

    public function mediaTimeRule(): HasOne
    {
        return $this->hasOne(MediaTimeRule::class, 'parent_id');
    }

}
