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

    public function test_child_login_page_loads(): void
    {
        $response = $this->get(route('child.login'));
        $response->assertStatus(200);
    }

    public function test_child_can_login_with_correct_pin(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create([
            'parent_id'     => $parent->id,
            'pin'           => '1234',
            'language_pair' => LanguagePair::DE_EN,
        ]);

        $response = $this->post(route('child.login.post'), [
            'child_id' => $child->id,
            'pin'      => '1234',
        ]);

        $response->assertRedirect(route('child.home'));
        $this->assertEquals($child->id, session('child_id'));
    }

    public function test_child_cannot_login_with_wrong_pin(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create([
            'parent_id'     => $parent->id,
            'pin'           => '1234',
            'language_pair' => LanguagePair::DE_EN,
        ]);

        $response = $this->post(route('child.login.post'), [
            'child_id' => $child->id,
            'pin'      => '9999',
        ]);

        $response->assertSessionHasErrors();
        $this->assertNull(session('child_id'));
    }

    public function test_child_logout_clears_session(): void
    {
        $parent = User::factory()->create();
        $child = Child::factory()->create([
            'parent_id'     => $parent->id,
            'pin'           => '1234',
            'language_pair' => LanguagePair::DE_EN,
        ]);

        $this->withSession(['child_id' => $child->id])
            ->post(route('child.logout'));

        $this->assertNull(session('child_id'));
    }

    public function test_child_routes_require_child_auth(): void
    {
        $response = $this->get(route('child.home'));
        $response->assertRedirect(route('child.login'));
    }

    public function test_parent_routes_require_parent_auth(): void
    {
        $response = $this->get(route('parent.dashboard'));
        $response->assertRedirect(route('login'));
    }
}
