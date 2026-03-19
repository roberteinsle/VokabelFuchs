<?php

namespace App\Models;

use App\Enums\MediaTimeAction;
use App\Enums\MediaTimeType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaTimeLog extends Model
{
    protected $fillable = [
        'child_id',
        'training_session_id',
        'type',
        'action',
        'minutes',
        'balance_after',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'type' => MediaTimeType::class,
            'action' => MediaTimeAction::class,
            'minutes' => 'integer',
            'balance_after' => 'integer',
        ];
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class, 'training_session_id');
    }
}
