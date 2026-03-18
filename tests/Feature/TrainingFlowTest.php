<?php

namespace Tests\Feature;

use App\Enums\LanguagePair;
use App\Models\Child;
use App\Models\FlashCard;
use App\Models\Vocabulary;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrainingFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $parent;
    private Child $child;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parent = User::factory()->create(['pin' => null]);
        $this->child = Child::factory()->create([
            'parent_id'     => $this->parent->id,
            'pin'           => '1234',
            'language_pair' => LanguagePair::DE_EN,
        ]);
    }

    private function actingAsChild(): static
    {
        return $this->actingAs($this->parent)
            ->withSession(['child_id' => $this->child->id]);
    }

    private function createDueVocabWithCard(): FlashCard
    {
        $vocab = Vocabulary::factory()->create(['parent_id' => $this->parent->id]);
        return FlashCard::create([
            'vocabulary_id'    => $vocab->id,
            'child_id'         => $this->child->id,
            'drawer'           => 1,
            'next_review_date' => Carbon::today(),
            'streak_count'     => 0,
        ]);
    }

    public function test_training_index_loads_for_child(): void
    {
        $response = $this->actingAsChild()->get(route('child.training.index'));
        $response->assertStatus(200);
    }

    public function test_can_start_training_session_with_due_cards(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->createDueVocabWithCard();
        }

        $response = $this->actingAsChild()->post(route('child.training.start'), [
            'training_mode' => 'multiple_choice',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('training_sessions', [
            'child_id' => $this->child->id,
        ]);
    }

    public function test_answering_correct_moves_card_up(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->createDueVocabWithCard();
        }

        $this->actingAsChild()->post(route('child.training.start'), [
            'training_mode' => 'multiple_choice',
        ]);

        $session = $this->child->trainingSessions()->latest()->first();
        $card = FlashCard::where('child_id', $this->child->id)->where('drawer', 1)->first();

        $this->actingAsChild()->post(route('child.training.answer', $session->id), [
            'flash_card_id' => $card->id,
            'answer'        => $card->vocabulary->word_en,
            'mode'          => 'multiple_choice',
            'target_lang'   => 'en',
        ]);

        $this->assertEquals(2, $card->fresh()->drawer);
    }

    public function test_finish_session_records_ended_at(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->createDueVocabWithCard();
        }

        $this->actingAsChild()->post(route('child.training.start'), [
            'training_mode' => 'multiple_choice',
        ]);

        $session = $this->child->trainingSessions()->latest()->first();

        $this->actingAsChild()->post(route('child.training.finish', $session->id));

        $this->assertNotNull($session->fresh()->ended_at);
    }
}
