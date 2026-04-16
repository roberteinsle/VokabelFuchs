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
     * Returns the earned minutes (single pool).
     */
    public function previewPerAnswer(string $mode, int $parentId): float
    {
        $rule = MediaTimeRule::where('parent_id', $parentId)->first();

        $base = $rule ? (float) $rule->base_minutes_per_correct : 0.50;

        if ($rule) {
            $multiplier = $this->getModeMultiplier($rule, $mode);
        } else {
            $multiplier = match ($mode) {
                'multiple_choice' => 1.00,
                'free_text' => 1.50,
                'dictation' => 2.00,
                default => 1.0,
            };
        }

        return round($base * $multiplier, 1);
    }

    /**
     * Calculate how much media time a child earns from a training session.
     * Returns earned minutes (single pool).
     */
    public function calculateEarnings(TrainingSession $session): float
    {
        $rule = MediaTimeRule::where('parent_id', $session->child->parent_id)->first();

        $cardsCorrect = $session->cards_correct ?? 0;
        $trainingMode = $session->training_mode?->value ?? $session->training_mode ?? 'multiple_choice';

        if ($rule) {
            $base = (float) $rule->base_minutes_per_correct;
            $multiplier = $this->getModeMultiplier($rule, $trainingMode);
        } else {
            $base = 0.50;
            $multiplier = match ($trainingMode) {
                'multiple_choice' => 1.00,
                'free_text' => 1.50,
                'dictation' => 2.00,
                default => 1.0,
            };
        }

        return round($cardsCorrect * $base * $multiplier, 1);
    }

    /**
     * Update the streak for a child after completing a training session.
     */
    public function updateStreak(Child $child): int
    {
        $today = Carbon::today()->toDateString();
        $lastDate = $child->last_trained_date ? $child->last_trained_date->toDateString() : null;

        if ($lastDate === $today) {
            return $child->current_streak;
        }

        $yesterday = Carbon::yesterday()->toDateString();

        if ($lastDate === $yesterday) {
            $child->current_streak = ($child->current_streak ?? 0) + 1;
        } else {
            $child->current_streak = 1;
        }

        $child->last_trained_date = $today;
        $child->save();

        return $child->current_streak;
    }

    /**
     * Credit earned media time to a child after finishing a session.
     * Single unified pool — no separate gaming/youtube earning.
     */
    public function creditFromSession(TrainingSession $session): float
    {
        $earned = $this->calculateEarnings($session);
        $child = $session->child;

        if ($earned <= 0) {
            return 0;
        }

        $amount = (int) round($earned);
        if ($amount > 0) {
            $this->credit($child, $amount, $session->id);
        }

        return $amount;
    }

    /**
     * Credit minutes to a child's unified balance.
     */
    public function credit(Child $child, int $minutes, ?int $sessionId = null): void
    {
        $child->increment('media_time_balance', $minutes);
        $newBalance = $child->fresh()->media_time_balance;

        MediaTimeLog::create([
            'child_id' => $child->id,
            'training_session_id' => $sessionId,
            'type' => 'earned',
            'action' => MediaTimeAction::EARNED->value,
            'minutes' => $minutes,
            'balance_after' => $newBalance,
        ]);
    }

    /**
     * Spend minutes from a child's unified balance.
     * Type (gaming/youtube) is tracked for daily cap enforcement.
     */
    public function spend(Child $child, MediaTimeType $type, int $minutes): bool
    {
        if ($child->media_time_balance < $minutes) {
            return false;
        }

        $child->decrement('media_time_balance', $minutes);
        $newBalance = $child->fresh()->media_time_balance;

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
     * Get total minutes earned today.
     */
    public function getTodayEarned(int $childId): int
    {
        return (int) MediaTimeLog::where('child_id', $childId)
            ->where('action', MediaTimeAction::EARNED->value)
            ->whereDate('created_at', today())
            ->sum('minutes');
    }

    /**
     * Get total minutes spent today for a given type.
     */
    public function getTodaySpent(int $childId, MediaTimeType $type): int
    {
        return (int) MediaTimeLog::where('child_id', $childId)
            ->where('type', $type->value)
            ->where('action', MediaTimeAction::SPENT->value)
            ->whereDate('created_at', today())
            ->sum('minutes');
    }

    /**
     * Get current unified balance.
     */
    public function getBalance(Child $child): int
    {
        return $child->media_time_balance;
    }
}
