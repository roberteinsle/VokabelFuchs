<?php

namespace App\Services;

use App\Enums\MediaTimeAction;
use App\Enums\MediaTimeType;
use App\Models\Child;
use App\Models\MediaTimeLog;
use App\Models\MediaTimeRule;
use App\Models\TrainingSession;

class MediaTimeService
{
    /**
     * Calculate how much media time a child earns from a training session.
     * Returns ['gaming' => int, 'youtube' => int] in minutes.
     */
    public function calculateEarnings(TrainingSession $session): array
    {
        $rule = MediaTimeRule::where('parent_id', $session->child->parent_id)->first();

        if (! $rule) {
            // Default rules if none configured
            $rule = new MediaTimeRule([
                'minutes_learn_per_gaming' => 10,
                'minutes_gaming_per_learn' => 15,
                'minutes_learn_per_youtube' => 10,
                'minutes_youtube_per_learn' => 10,
                'min_learn_for_unlock' => 5,
            ]);
        }

        $learnedMinutes = $session->getDurationMinutes();

        if ($learnedMinutes < $rule->min_learn_for_unlock) {
            return ['gaming' => 0, 'youtube' => 0];
        }

        $gamingBlocks = (int) floor($learnedMinutes / $rule->minutes_learn_per_gaming);
        $youtubeBlocks = (int) floor($learnedMinutes / $rule->minutes_learn_per_youtube);

        return [
            'gaming' => $gamingBlocks * $rule->minutes_gaming_per_learn,
            'youtube' => $youtubeBlocks * $rule->minutes_youtube_per_learn,
        ];
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
                $this->credit($child, $type, $amount, $session->id);
                $credited[$key] = $amount;
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
