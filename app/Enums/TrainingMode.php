<?php

namespace App\Enums;

enum TrainingMode: string
{
    case MULTIPLE_CHOICE = 'multiple_choice';
    case FREE_TEXT = 'free_text';
    case DICTATION = 'dictation'; // Phase 2

    public function label(): string
    {
        return match($this) {
            self::MULTIPLE_CHOICE => 'Auswählen',
            self::FREE_TEXT       => 'Schreiben',
            self::DICTATION       => 'Diktat',
        };
    }
}
