<?php

namespace Tests\Feature;

use App\Enums\LanguagePair;
use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChildPinAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_selection_is_public(): void
    {
        $response = $this->get(route('profiles.index'));
        $response->assertStatus(200); // public route
    }

    public function test_authenticated_user_sees_profile_selection(): void
    {
        $parent = User::factory()->create();
        $response = $this->actingAs($parent)->get(route('profiles.index'));
        $response->assertStatus(200);
    }

    public function test_child_can_unlock_profile_with_correct_pin(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create([
            'parent_id' => $parent->id,
            'pin' => '1234',
            'language_pair' => LanguagePair::DE_EN,
        ]);

        $response = $this->actingAs($parent)->post(route('profiles.unlock'), [
            'type' => 'child',
            'id' => $child->id,
            'pin' => '1234',
        ]);

        $response->assertRedirect(route('child.home'));
        $this->assertEquals($child->id, session('child_id'));
    }

    public function test_child_cannot_unlock_with_wrong_pin(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create([
            'parent_id' => $parent->id,
            'pin' => '1234',
            'language_pair' => LanguagePair::DE_EN,
        ]);

        $response = $this->actingAs($parent)->post(route('profiles.unlock'), [
            'type' => 'child',
            'id' => $child->id,
            'pin' => '9999',
        ]);

        $response->assertSessionHasErrors();
        $this->assertNull(session('child_id'));
    }

    public function test_profile_lock_clears_session(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create([
            'parent_id' => $parent->id,
            'language_pair' => LanguagePair::DE_EN,
        ]);

        $this->actingAs($parent)
            ->withSession(['child_id' => $child->id])
            ->post(route('profiles.lock'));

        $this->assertNull(session('child_id'));
        $this->assertNull(session('parent_profile_unlocked'));
    }

    public function test_child_routes_require_child_session(): void
    {
        $parent = User::factory()->create();
        $response = $this->actingAs($parent)->get(route('child.home'));
        $response->assertRedirect(route('profiles.index'));
    }

    public function test_parent_routes_require_parent_auth(): void
    {
        $response = $this->get(route('parent.dashboard'));
        $response->assertRedirect('/');
    }

    public function test_parent_with_pin_redirected_to_profiles_without_unlock(): void
    {
        $parent = User::factory()->create(['pin' => '1234']);
        $response = $this->actingAs($parent)->get(route('parent.dashboard'));
        $response->assertRedirect(route('profiles.index'));
    }

    public function test_parent_without_pin_can_access_dashboard_directly(): void
    {
        $parent = User::factory()->create(['pin' => null]);
        $response = $this->actingAs($parent)->get(route('parent.dashboard'));
        $response->assertStatus(200);
    }
}
