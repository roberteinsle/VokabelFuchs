<?php

namespace App\Services;

class LevenshteinService
{
    /**
     * Check if user input is close enough to the target word.
     * Words <= 3 chars require exact match.
     * For longer words: tolerance = floor(length * 0.2), min 1.
     */
    public function isAcceptable(string $input, string $target): bool
    {
        $input  = mb_strtolower(trim($input));
        $target = mb_strtolower(trim($target));

        if ($input === $target) {
            return true;
        }

        $targetLen = mb_strlen($target);

        if ($targetLen <= 3) {
            return false; // exact match required for short words
        }

        $maxDistance = max(1, (int) floor($targetLen * 0.2));
        $distance = levenshtein($input, $target);

        return $distance <= $maxDistance;
    }

    /**
     * Calculate Levenshtein distance between two strings.
     */
    public function distance(string $a, string $b): int
    {
        return levenshtein(
            mb_strtolower(trim($a)),
            mb_strtolower(trim($b))
        );
    }
}
