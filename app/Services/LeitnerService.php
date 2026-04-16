<?php

namespace App\Services;

use App\Models\Child;
use App\Models\FlashCard;
use App\Models\Vocabulary;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class LeitnerService
{
    /**
     * Get the next review date for a given drawer number.
     */
    public function getNextReviewDate(int $drawer): Carbon
    {
        $intervals = config('leitner.intervals');
        $days = $intervals[$drawer] ?? 1;

        return Carbon::today()->addDays($days);
    }

    /**
     * Move a flash card based on whether the answer was correct.
     * Returns the new drawer number.
     */
    public function moveCard(FlashCard $card, bool $correct): int
    {
        $maxDrawer = config('leitner.drawers', 5);
        $drawerBefore = $card->drawer;

        if ($correct) {
            $newDrawer = min($card->drawer + 1, $maxDrawer);
        } else {
            $newDrawer = 1;
        }

        $card->drawer = $newDrawer;
        $card->next_review_date = $this->getNextReviewDate($newDrawer);
        $card->last_reviewed_at = now();

        if ($correct) {
            $card->streak_count++;
        } else {
            $card->streak_count = 0;
        }

        $card->save();

        return $newDrawer;
    }

    /**
     * Get all due cards for a child (next_review_date <= today).
     * If $forceAll is true, return all cards regardless of review date.
     *
     * @return Collection
     */
    /**
     * Get due cards for a child.
     * $drawers: if set, return all cards in those drawers (ignores next_review_date).
     * If null/empty, return only cards due today.
     */
    public function getDueCards(int $childId, ?array $tagIds = null, ?string $mode = null, ?array $drawers = null)
    {
        $limit = config('leitner.session_card_limit', 20);

        $query = FlashCard::with(['vocabulary.tags'])
            ->where('child_id', $childId)
            ->orderBy('drawer')
            ->orderBy('next_review_date');

        if (! empty($drawers)) {
            $query->whereIn('drawer', $drawers);
        } else {
            $query->where('next_review_date', '<=', Carbon::today());
        }

        if ($mode) {
            $query->where('training_mode', $mode);
        }

        if ($tagIds) {
            $query->whereHas('vocabulary.tags', fn ($q) => $q->whereIn('tags.id', $tagIds));
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get drawer statistics (count per drawer) for a child, optionally filtered by mode.
     */
    public function getDrawerStats(int $childId, ?string $mode = null): array
    {
        $query = FlashCard::where('child_id', $childId);
        if ($mode) {
            $query->where('training_mode', $mode);
        }

        $counts = $query->selectRaw('drawer, COUNT(*) as count')
            ->groupBy('drawer')
            ->pluck('count', 'drawer')
            ->toArray();

        $maxDrawer = config('leitner.drawers', 5);
        $stats = [];
        for ($i = 1; $i <= $maxDrawer; $i++) {
            $stats[$i] = $counts[$i] ?? 0;
        }

        return $stats;
    }

    /**
     * Get drawer statistics for all training modes for a child.
     */
    public function getDrawerStatsByMode(int $childId): array
    {
        $modes = ['multiple_choice', 'free_text', 'dictation'];
        $result = [];
        foreach ($modes as $mode) {
            $result[$mode] = $this->getDrawerStats($childId, $mode);
        }

        return $result;
    }

    /**
     * Reset all flash cards of a given mode back to drawer 1.
     */
    public function resetToDrawer1(int $childId, string $mode): int
    {
        return FlashCard::where('child_id', $childId)
            ->where('training_mode', $mode)
            ->update([
                'drawer' => 1,
                'next_review_date' => Carbon::today(),
                'streak_count' => 0,
            ]);
    }

    /**
     * Create flash cards for a child based on their assigned tags/clusters.
     * Only creates cards for vocabularies that have at least one tag assigned to the child.
     */
    public function createMissingCards(int $childId, int $parentId): int
    {
        $assignedTagIds = Child::find($childId)
            ->tags()
            ->pluck('tags.id')
            ->toArray();

        if (empty($assignedTagIds)) {
            return 0;
        }

        $modes = ['multiple_choice', 'free_text', 'dictation'];

        // Existing (vocabulary_id, training_mode) combos for this child
        $existing = FlashCard::where('child_id', $childId)
            ->select('vocabulary_id', 'training_mode')
            ->get()
            ->map(fn ($r) => $r->vocabulary_id.'_'.$r->training_mode)
            ->toArray();

        $vocabularies = Vocabulary::where('parent_id', $parentId)
            ->where('is_active', true)
            ->whereHas('tags', fn ($q) => $q->whereIn('tags.id', $assignedTagIds))
            ->get();

        $created = 0;
        foreach ($vocabularies as $vocab) {
            foreach ($modes as $mode) {
                if (in_array($vocab->id.'_'.$mode, $existing)) {
                    continue;
                }
                FlashCard::create([
                    'vocabulary_id' => $vocab->id,
                    'child_id' => $childId,
                    'training_mode' => $mode,
                    'drawer' => 1,
                    'next_review_date' => Carbon::today(),
                    'streak_count' => 0,
                ]);
                $created++;
            }
        }

        return $created;
    }

    /**
     * Remove flash cards for vocabularies that are no longer linked to any
     * tag assigned to the child.
     */
    public function removeOrphanedCards(int $childId): int
    {
        $assignedTagIds = Child::find($childId)
            ->tags()
            ->pluck('tags.id')
            ->toArray();

        if (empty($assignedTagIds)) {
            // Child has no tags → remove ALL flash cards
            return FlashCard::where('child_id', $childId)->delete();
        }

        // Find vocabulary IDs that still have at least one assigned tag
        $validVocabIds = Vocabulary::whereHas('tags', fn ($q) => $q->whereIn('tags.id', $assignedTagIds))
            ->pluck('id')
            ->toArray();

        // Delete cards for vocabularies no longer covered by any assigned tag
        return FlashCard::where('child_id', $childId)
            ->whereNotIn('vocabulary_id', $validVocabIds)
            ->delete();
    }
}
