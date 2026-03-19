<?php

namespace App\Enums;

enum LanguagePair: string
{
    case DE_EN = 'de_en';
    case DE_FR = 'de_fr';

    public function label(): string
    {
        return match ($this) {
            self::DE_EN => 'Deutsch ↔ Englisch',
            self::DE_FR => 'Deutsch ↔ Französisch',
        };
    }

    public function sourceLang(): string
    {
        return 'de';
    }

    public function targetLang(): string
    {
        return match ($this) {
            self::DE_EN => 'en',
            self::DE_FR => 'fr',
        };
    }
}
