<?php

namespace App\Services;

use App\Models\FlashCard;
use Carbon\Carbon;

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
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getDueCards(int $childId, ?array $tagIds = null)
    {
        $limit = config('leitner.session_card_limit', 20);

        $query = FlashCard::with(['vocabulary.tags'])
            ->where('child_id', $childId)
            ->where('next_review_date', '<=', Carbon::today())
            ->orderBy('drawer')
            ->orderBy('next_review_date');

        if ($tagIds) {
            $query->whereHas('vocabulary.tags', fn ($q) => $q->whereIn('tags.id', $tagIds));
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get drawer statistics (count per drawer) for a child.
     */
    public function getDrawerStats(int $childId): array
    {
        $counts = FlashCard::where('child_id', $childId)
            ->selectRaw('drawer, COUNT(*) as count')
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
     * Create flash cards for a child based on their assigned tags/clusters.
     * Only creates cards for vocabularies that have at least one tag assigned to the child.
     */
    public function createMissingCards(int $childId, int $parentId): int
    {
        $assignedTagIds = \App\Models\Child::find($childId)
            ->tags()
            ->pluck('tags.id')
            ->toArray();

        if (empty($assignedTagIds)) {
            return 0;
        }

        $existingIds = FlashCard::where('child_id', $childId)->pluck('vocabulary_id')->toArray();

        $vocabularies = \App\Models\Vocabulary::where('parent_id', $parentId)
            ->where('is_active', true)
            ->whereNotIn('id', $existingIds)
            ->whereHas('tags', fn ($q) => $q->whereIn('tags.id', $assignedTagIds))
            ->get();

        $created = 0;
        foreach ($vocabularies as $vocab) {
            FlashCard::create([
                'vocabulary_id'    => $vocab->id,
                'child_id'         => $childId,
                'drawer'           => 1,
                'next_review_date' => Carbon::today(),
                'streak_count'     => 0,
            ]);
            $created++;
        }

        return $created;
    }
}
