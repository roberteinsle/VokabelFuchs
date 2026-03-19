<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vocabulary extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'vocabulary_list_id',
        'word_de',
        'word_en',
        'word_fr',
        'sentence_de',
        'sentence_en',
        'sentence_fr',
        'image_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function vocabularyList(): BelongsTo
    {
        return $this->belongsTo(VocabularyList::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'vocabulary_tag');
    }

    public function flashCards(): HasMany
    {
        return $this->hasMany(FlashCard::class);
    }

    public function getWordForLang(string $lang): ?string
    {
        return match ($lang) {
            'de' => $this->word_de,
            'en' => $this->word_en,
            'fr' => $this->word_fr,
            default => null,
        };
    }

    public function getSentenceForLang(string $lang): ?string
    {
        return match ($lang) {
            'de' => $this->sentence_de,
            'en' => $this->sentence_en,
            'fr' => $this->sentence_fr,
            default => null,
        };
    }
}
