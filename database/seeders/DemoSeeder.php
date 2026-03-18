<?php

namespace Database\Seeders;

use App\Enums\LanguagePair;
use App\Models\Child;
use App\Models\FlashCard;
use App\Models\MediaTimeRule;
use App\Models\Tag;
use App\Models\User;
use App\Models\Vocabulary;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo parent
        $parent = User::firstOrCreate(
            ['email' => 'demo@vokabelfuchs.de'],
            [
                'name'     => 'Demo Elternteil',
                'password' => Hash::make('password'),
            ]
        );

        // Media time rules
        MediaTimeRule::firstOrCreate(
            ['parent_id' => $parent->id],
            [
                'minutes_learn_per_gaming'   => 10,
                'minutes_learn_per_youtube'  => 10,
                'daily_cap_gaming'           => 60,
                'daily_cap_youtube'          => 30,
                'min_learn_for_unlock'       => 5,
            ]
        );

        // Create demo children
        $kind1 = Child::firstOrCreate(
            ['username' => 'lena', 'parent_id' => $parent->id],
            [
                'name'          => 'Lena',
                'pin'           => '1234',
                'language_pair' => LanguagePair::DE_EN,
                'is_active'     => true,
            ]
        );

        $kind2 = Child::firstOrCreate(
            ['username' => 'max', 'parent_id' => $parent->id],
            [
                'name'          => 'Max',
                'pin'           => '5678',
                'language_pair' => LanguagePair::DE_FR,
                'is_active'     => true,
            ]
        );

        // Tags
        $tags = collect([
            'Schule', 'Tiere', 'Essen', 'Farben', 'Zahlen', 'Familie',
        ])->map(fn($name) => Tag::firstOrCreate(
            ['name' => $name, 'parent_id' => $parent->id]
        ));

        $tagSchule  = $tags->firstWhere('name', 'Schule');
        $tagTiere   = $tags->firstWhere('name', 'Tiere');
        $tagEssen   = $tags->firstWhere('name', 'Essen');
        $tagFarben  = $tags->firstWhere('name', 'Farben');
        $tagZahlen  = $tags->firstWhere('name', 'Zahlen');
        $tagFamilie = $tags->firstWhere('name', 'Familie');

        // Vocabulary list
        $vocabs = [
            // Tiere
            ['de' => 'der Hund',    'en' => 'dog',    'fr' => 'le chien',    'tags' => [$tagTiere->id]],
            ['de' => 'die Katze',   'en' => 'cat',    'fr' => 'le chat',     'tags' => [$tagTiere->id]],
            ['de' => 'der Vogel',   'en' => 'bird',   'fr' => 'l\'oiseau',   'tags' => [$tagTiere->id]],
            ['de' => 'das Pferd',   'en' => 'horse',  'fr' => 'le cheval',   'tags' => [$tagTiere->id]],
            ['de' => 'der Fisch',   'en' => 'fish',   'fr' => 'le poisson',  'tags' => [$tagTiere->id]],
            // Essen
            ['de' => 'der Apfel',   'en' => 'apple',  'fr' => 'la pomme',    'tags' => [$tagEssen->id]],
            ['de' => 'das Brot',    'en' => 'bread',  'fr' => 'le pain',     'tags' => [$tagEssen->id]],
            ['de' => 'die Milch',   'en' => 'milk',   'fr' => 'le lait',     'tags' => [$tagEssen->id]],
            ['de' => 'das Wasser',  'en' => 'water',  'fr' => 'l\'eau',      'tags' => [$tagEssen->id]],
            ['de' => 'der Kuchen',  'en' => 'cake',   'fr' => 'le gâteau',   'tags' => [$tagEssen->id]],
            // Farben
            ['de' => 'rot',         'en' => 'red',    'fr' => 'rouge',       'tags' => [$tagFarben->id]],
            ['de' => 'blau',        'en' => 'blue',   'fr' => 'bleu',        'tags' => [$tagFarben->id]],
            ['de' => 'grün',        'en' => 'green',  'fr' => 'vert',        'tags' => [$tagFarben->id]],
            ['de' => 'gelb',        'en' => 'yellow', 'fr' => 'jaune',       'tags' => [$tagFarben->id]],
            ['de' => 'schwarz',     'en' => 'black',  'fr' => 'noir',        'tags' => [$tagFarben->id]],
            // Familie
            ['de' => 'die Mutter',  'en' => 'mother', 'fr' => 'la mère',     'tags' => [$tagFamilie->id]],
            ['de' => 'der Vater',   'en' => 'father', 'fr' => 'le père',     'tags' => [$tagFamilie->id]],
            ['de' => 'die Schwester','en' => 'sister','fr' => 'la sœur',     'tags' => [$tagFamilie->id]],
            ['de' => 'der Bruder',  'en' => 'brother','fr' => 'le frère',    'tags' => [$tagFamilie->id]],
            // Schule
            ['de' => 'das Buch',    'en' => 'book',   'fr' => 'le livre',    'tags' => [$tagSchule->id]],
            ['de' => 'der Stift',   'en' => 'pen',    'fr' => 'le stylo',    'tags' => [$tagSchule->id]],
            ['de' => 'die Schule',  'en' => 'school', 'fr' => 'l\'école',    'tags' => [$tagSchule->id]],
            ['de' => 'der Lehrer',  'en' => 'teacher','fr' => 'le professeur','tags' => [$tagSchule->id]],
            ['de' => 'das Heft',    'en' => 'notebook','fr' => 'le cahier',  'tags' => [$tagSchule->id]],
            // Zahlen
            ['de' => 'eins',        'en' => 'one',    'fr' => 'un',          'tags' => [$tagZahlen->id]],
            ['de' => 'zwei',        'en' => 'two',    'fr' => 'deux',        'tags' => [$tagZahlen->id]],
            ['de' => 'drei',        'en' => 'three',  'fr' => 'trois',       'tags' => [$tagZahlen->id]],
            ['de' => 'vier',        'en' => 'four',   'fr' => 'quatre',      'tags' => [$tagZahlen->id]],
            ['de' => 'fünf',        'en' => 'five',   'fr' => 'cinq',        'tags' => [$tagZahlen->id]],
        ];

        foreach ($vocabs as $v) {
            $vocab = Vocabulary::firstOrCreate(
                ['word_de' => $v['de'], 'parent_id' => $parent->id],
                [
                    'word_en' => $v['en'],
                    'word_fr' => $v['fr'],
                ]
            );
            $vocab->tags()->syncWithoutDetaching($v['tags']);
        }

        // Create flash cards for both children
        $allVocabs = Vocabulary::where('parent_id', $parent->id)->get();
        foreach ([$kind1, $kind2] as $child) {
            foreach ($allVocabs as $vocab) {
                FlashCard::firstOrCreate(
                    ['vocabulary_id' => $vocab->id, 'child_id' => $child->id],
                    [
                        'drawer'           => 1,
                        'next_review_date' => now()->toDateString(),
                        'streak_count'     => 0,
                    ]
                );
            }
        }

        $this->command->info('Demo data seeded: demo@vokabelfuchs.de / password');
        $this->command->info('Children: Lena (PIN: 1234), Max (PIN: 5678)');
    }
}
