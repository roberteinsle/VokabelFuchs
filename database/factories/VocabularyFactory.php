<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VocabularyFactory extends Factory
{
    public function definition(): array
    {
        $words = [
            ['de' => 'der Hund',   'en' => 'dog',    'fr' => 'le chien'],
            ['de' => 'die Katze',  'en' => 'cat',    'fr' => 'le chat'],
            ['de' => 'das Buch',   'en' => 'book',   'fr' => 'le livre'],
            ['de' => 'das Haus',   'en' => 'house',  'fr' => 'la maison'],
            ['de' => 'der Apfel',  'en' => 'apple',  'fr' => 'la pomme'],
            ['de' => 'das Auto',   'en' => 'car',    'fr' => 'la voiture'],
            ['de' => 'die Schule', 'en' => 'school', 'fr' => 'l\'école'],
            ['de' => 'die Stadt',  'en' => 'city',   'fr' => 'la ville'],
        ];

        $word = $this->faker->randomElement($words);

        return [
            'parent_id' => User::factory(),
            'word_de' => $word['de'].' '.$this->faker->unique()->numberBetween(1, 9999),
            'word_en' => $word['en'],
            'word_fr' => $word['fr'],
        ];
    }
}
