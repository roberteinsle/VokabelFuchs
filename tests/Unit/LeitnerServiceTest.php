<?php

namespace Tests\Unit;

use App\Models\FlashCard;
use App\Models\Vocabulary;
use App\Models\Child;
use App\Models\User;
use App\Services\LeitnerService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeitnerServiceTest extends TestCase
{
    use RefreshDatabase;

    private LeitnerService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LeitnerService();
    }

    public function test_correct_answer_moves_card_up_one_drawer(): void
    {
        $card = $this->makeCard(drawer: 1);
        $newDrawer = $this->service->moveCard($card, correct: true);
        $this->assertEquals(2, $newDrawer);
        $this->assertEquals(2, $card->fresh()->drawer);
    }

    public function test_wrong_answer_moves_card_to_drawer_one(): void
    {
        $card = $this->makeCard(drawer: 4);
        $newDrawer = $this->service->moveCard($card, correct: false);
        $this->assertEquals(1, $newDrawer);
        $this->assertEquals(1, $card->fresh()->drawer);
    }

    public function test_card_in_drawer_five_stays_in_five_on_correct(): void
    {
        $card = $this->makeCard(drawer: 5);
        $newDrawer = $this->service->moveCard($card, correct: true);
        $this->assertEquals(5, $newDrawer);
    }

    public function test_next_review_date_for_drawer_one_is_today(): void
    {
        $date = $this->service->getNextReviewDate(1);
        $this->assertEquals(Carbon::today()->toDateString(), $date->toDateString());
    }

    public function test_next_review_date_for_drawer_two_is_two_days(): void
    {
        $date = $this->service->getNextReviewDate(2);
        $this->assertEquals(Carbon::today()->addDays(2)->toDateString(), $date->toDateString());
    }

    public function test_next_review_date_for_drawer_five_is_thirty_days(): void
    {
        $date = $this->service->getNextReviewDate(5);
        $this->assertEquals(Carbon::today()->addDays(30)->toDateString(), $date->toDateString());
    }

    public function test_get_due_cards_returns_only_due_cards(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create(['parent_id' => $parent->id]);

        // Due today
        $this->makeCard(drawer: 1, childId: $child->id, nextReview: Carbon::today());
        $this->makeCard(drawer: 1, childId: $child->id, nextReview: Carbon::today());
        // Not yet due
        $this->makeCard(drawer: 2, childId: $child->id, nextReview: Carbon::tomorrow());

        $due = $this->service->getDueCards($child->id);
        $this->assertCount(2, $due);
    }

    public function test_get_drawer_stats_returns_counts_per_drawer(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create(['parent_id' => $parent->id]);

        $this->makeCard(drawer: 1, childId: $child->id);
        $this->makeCard(drawer: 1, childId: $child->id);
        $this->makeCard(drawer: 3, childId: $child->id);

        $stats = $this->service->getDrawerStats($child->id);
        $this->assertEquals(2, $stats[1]);
        $this->assertEquals(0, $stats[2]);
        $this->assertEquals(1, $stats[3]);
    }

    private function makeCard(int $drawer = 1, ?int $childId = null, ?Carbon $nextReview = null): FlashCard
    {
        if ($childId === null) {
            $parent = User::factory()->create();
            $child = Child::factory()->create(['parent_id' => $parent->id]);
            $childId = $child->id;
        }

        $vocab = Vocabulary::factory()->create();

        return FlashCard::create([
            'vocabulary_id'    => $vocab->id,
            'child_id'         => $childId,
            'drawer'           => $drawer,
            'next_review_date' => $nextReview ?? Carbon::today(),
            'streak_count'     => 0,
        ]);
    }
}
