<?php

namespace App\Services;

use App\Enums\MediaTimeAction;
use App\Enums\MediaTimeType;
use App\Models\Child;
use App\Models\MediaTimeLog;
use App\Models\MediaTimeRule;
use App\Models\TrainingSession;
use Carbon\Carbon;

class MediaTimeService
{
    /**
     * Get the mode multiplier from a rule for a given training mode.
     */
    private function getModeMultiplier(MediaTimeRule $rule, string $mode): float
    {
        return (float) match ($mode) {
            'multiple_choice' => $rule->multiplier_multiple_choice,
            'free_text' => $rule->multiplier_free_text,
            'dictation' => $rule->multiplier_dictation,
            default => 1.0,
        };
    }

    /**
     * Preview media time earned per correct answer for a given mode and parent.
     * Returns ['gaming' => float, 'youtube' => float].
     */
    public function previewPerAnswer(string $mode, int $parentId): array
    {
        $rule = MediaTimeRule::where('parent_id', $parentId)->first();

        $base = $rule ? (float) $rule->base_minutes_per_correct : 0.50;
        $multiplier = 1.0;
        $gamingRate = 1.50;
        $youtubeRate = 1.00;

        if ($rule) {
            $multiplier = $this->getModeMultiplier($rule, $mode);
            $gamingRate = (float) $rule->gaming_exchange_rate;
            $youtubeRate = (float) $rule->youtube_exchange_rate;
        } else {
            $multiplier = match ($mode) {
                'multiple_choice' => 1.00,
                'free_text' => 1.50,
                'dictation' => 2.00,
                default => 1.0,
            };
        }

        return [
            'gaming' => round($base * $multiplier * $gamingRate, 1),
            'youtube' => round($base * $multiplier * $youtubeRate, 1),
        ];
    }

    /**
     * Calculate how much media time a child earns from a training session.
     * Returns ['gaming' => float, 'youtube' => float] in minutes.
     */
    public function calculateEarnings(TrainingSession $session): array
    {
        $rule = MediaTimeRule::where('parent_id', $session->child->parent_id)->first();

        $learnedMinutes = $session->getDurationMinutes();
        $cardsCorrect = $session->cards_correct ?? 0;
        $trainingMode = $session->training_mode?->value ?? $session->training_mode ?? 'multiple_choice';

        if ($rule) {
            // New answer-based calculation
            if ($learnedMinutes < $rule->min_learn_for_unlock) {
                return ['gaming' => 0, 'youtube' => 0];
            }

            $base = (float) $rule->base_minutes_per_correct;
            $multiplier = $this->getModeMultiplier($rule, $trainingMode);
            $gamingRate = (float) $rule->gaming_exchange_rate;
            $youtubeRate = (float) $rule->youtube_exchange_rate;

            $earnedMinutes = $cardsCorrect * $base * $multiplier;

            return [
                'gaming' => round($earnedMinutes * $gamingRate, 1),
                'youtube' => round($earnedMinutes * $youtubeRate, 1),
            ];
        }

        // Default rules if none configured (legacy calculation)
        $defaultRule = new MediaTimeRule([
            'minutes_learn_per_gaming' => 10,
            'minutes_gaming_per_learn' => 15,
            'minutes_learn_per_youtube' => 10,
            'minutes_youtube_per_learn' => 10,
            'min_learn_for_unlock' => 5,
        ]);

        if ($learnedMinutes < $defaultRule->min_learn_for_unlock) {
            return ['gaming' => 0, 'youtube' => 0];
        }

        $gamingBlocks = (int) floor($learnedMinutes / $defaultRule->minutes_learn_per_gaming);
        $youtubeBlocks = (int) floor($learnedMinutes / $defaultRule->minutes_learn_per_youtube);

        return [
            'gaming' => $gamingBlocks * $defaultRule->minutes_gaming_per_learn,
            'youtube' => $youtubeBlocks * $defaultRule->minutes_youtube_per_learn,
        ];
    }

    /**
     * Update the streak for a child after completing a training session.
     * Returns the new streak value.
     */
    public function updateStreak(Child $child): int
    {
        $today = Carbon::today()->toDateString();
        $lastDate = $child->last_trained_date ? $child->last_trained_date->toDateString() : null;

        if ($lastDate === $today) {
            // Already trained today – no change
            return $child->current_streak;
        }

        $yesterday = Carbon::yesterday()->toDateString();

        if ($lastDate === $yesterday) {
            // Consecutive day – increment streak
            $child->current_streak = ($child->current_streak ?? 0) + 1;
        } else {
            // Streak broken or first training – reset to 1
            $child->current_streak = 1;
        }

        $child->last_trained_date = $today;
        $child->save();

        return $child->current_streak;
    }

    /**
     * Credit earned media time to a child after finishing a session.
     * Respects daily caps.
     */
    public function creditFromSession(TrainingSession $session): array
    {
        $earnings = $this->calculateEarnings($session);
        $child = $session->child;
        $rule = MediaTimeRule::where('parent_id', $child->parent_id)->first();

        $credited = ['gaming' => 0, 'youtube' => 0];

        foreach ([MediaTimeType::GAMING, MediaTimeType::YOUTUBE] as $type) {
            $key = $type->value;
            $amount = $earnings[$key] ?? 0;

            if ($amount <= 0) {
                continue;
            }

            // Apply daily cap
            if ($rule) {
                $cap = $key === 'gaming' ? $rule->daily_cap_gaming : $rule->daily_cap_youtube;
                $earnedToday = $this->getTodayEarned($child->id, $type);
                $amount = min($amount, max(0, $cap - $earnedToday));
            }

            if ($amount > 0) {
                $this->credit($child, $type, (int) round($amount), $session->id);
                $credited[$key] = (int) round($amount);
            }
        }

        return $credited;
    }

    /**
     * Credit minutes to a child's balance.
     */
    public function credit(Child $child, MediaTimeType $type, int $minutes, ?int $sessionId = null): void
    {
        $balanceField = $type === MediaTimeType::GAMING
            ? 'media_time_balance_gaming'
            : 'media_time_balance_youtube';

        $child->increment($balanceField, $minutes);
        $newBalance = $child->fresh()->{$balanceField};

        MediaTimeLog::create([
            'child_id' => $child->id,
            'training_session_id' => $sessionId,
            'type' => $type->value,
            'action' => MediaTimeAction::EARNED->value,
            'minutes' => $minutes,
            'balance_after' => $newBalance,
        ]);
    }

    /**
     * Spend minutes from a child's balance.
     * Returns true on success, false if insufficient balance.
     */
    public function spend(Child $child, MediaTimeType $type, int $minutes): bool
    {
        $balanceField = $type === MediaTimeType::GAMING
            ? 'media_time_balance_gaming'
            : 'media_time_balance_youtube';

        if ($child->{$balanceField} < $minutes) {
            return false;
        }

        $child->decrement($balanceField, $minutes);
        $newBalance = $child->fresh()->{$balanceField};

        MediaTimeLog::create([
            'child_id' => $child->id,
            'type' => $type->value,
            'action' => MediaTimeAction::SPENT->value,
            'minutes' => $minutes,
            'balance_after' => $newBalance,
        ]);

        return true;
    }

    /**
     * Get total minutes earned today for a given type.
     */
    public function getTodayEarned(int $childId, MediaTimeType $type): int
    {
        return (int) MediaTimeLog::where('child_id', $childId)
            ->where('type', $type->value)
            ->where('action', MediaTimeAction::EARNED->value)
            ->whereDate('created_at', today())
            ->sum('minutes');
    }

    /**
     * Get current balance for both types.
     */
    public function getBalance(Child $child): array
    {
        return [
            'gaming' => $child->media_time_balance_gaming,
            'youtube' => $child->media_time_balance_youtube,
        ];
    }
}
