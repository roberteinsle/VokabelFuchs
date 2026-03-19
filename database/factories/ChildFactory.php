<?php

namespace Database\Factories;

use App\Enums\LanguagePair;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChildFactory extends Factory
{
    public function definition(): array
    {
        return [
            'parent_id' => User::factory(),
            'name' => $this->faker->firstName(),
            'pin' => '1234',
            'language_pair' => LanguagePair::DE_EN,
            'is_active' => true,
            'media_time_balance_gaming' => 0,
            'media_time_balance_youtube' => 0,
        ];
    }
}
