<?php

namespace App\Enums;

enum MediaTimeType: string
{
    case GAMING = 'gaming';
    case YOUTUBE = 'youtube';

    public function label(): string
    {
        return match ($this) {
            self::GAMING => 'Gaming',
            self::YOUTUBE => 'YouTube',
        };
    }
}
