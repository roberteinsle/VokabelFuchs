<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['parent_id', 'vocabulary_list_id', 'name'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function vocabularyList(): BelongsTo
    {
        return $this->belongsTo(VocabularyList::class);
    }

    public function vocabularies(): BelongsToMany
    {
        return $this->belongsToMany(Vocabulary::class, 'vocabulary_tag');
    }

    public function children(): BelongsToMany
    {
        return $this->belongsToMany(Child::class, 'child_tag');
    }
}
