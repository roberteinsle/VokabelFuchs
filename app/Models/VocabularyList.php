<?php

namespace App\Models;

use App\Enums\LanguagePair;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['parent_id', 'name', 'language_pair', 'description'])]
class VocabularyList extends Model
{
    protected function casts(): array
    {
        return [
            'language_pair' => LanguagePair::class,
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    public function vocabularies(): HasMany
    {
        return $this->hasMany(Vocabulary::class);
    }
}
