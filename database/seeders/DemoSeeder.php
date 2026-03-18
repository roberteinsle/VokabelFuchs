<?php

namespace Database\Seeders;

use App\Enums\LanguagePair;
use App\Models\Child;
use App\Models\MediaTimeRule;
use App\Models\Tag;
use App\Models\User;
use App\Models\Vocabulary;
use App\Models\VocabularyList;
use App\Services\LeitnerService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $leitner = new LeitnerService();

        // Create demo parent
        $parent = User::firstOrCreate(
            ['email' => 'jr@einsle.com'],
            [
                'name'     => 'Demo Elternteil',
                'password' => Hash::make('7U9%!7#MehZSqkjherTK8u'),
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
            ['name' => 'Tobias', 'parent_id' => $parent->id],
            [
                'pin'           => '1234',
                'language_pair' => LanguagePair::DE_EN,
                'is_active'     => true,
            ]
        );

        Child::firstOrCreate(
            ['name' => 'Jonas', 'parent_id' => $parent->id],
            [
                'pin'       => '5678',
                'is_active' => true,
            ]
        );

        // === FACH: Englisch (DE_EN) ===
        $fachEn = VocabularyList::firstOrCreate(
            ['name' => 'Englisch Klasse 4', 'parent_id' => $parent->id],
            ['language_pair' => LanguagePair::DE_EN->value]
        );

        // Tags für Englisch-Fach
        $enTags = collect(['Nature', 'Animals', 'Camping'])
            ->map(fn ($name) => Tag::firstOrCreate(
                ['name' => $name, 'vocabulary_list_id' => $fachEn->id],
                ['parent_id' => $parent->id]
            ));

        $enNature  = $enTags->firstWhere('name', 'Nature');
        $enAnimals = $enTags->firstWhere('name', 'Animals');
        $enCamping = $enTags->firstWhere('name', 'Camping');

        // Vokabeln für Englisch-Fach
        $enVocabs = [
            // Nature
            ['de' => 'See',           'en' => 'lake',         'tags' => [$enNature->id]],
            ['de' => 'Stein',         'en' => 'rock',         'tags' => [$enNature->id]],
            ['de' => 'Meer',          'en' => 'sea',          'tags' => [$enNature->id]],
            ['de' => 'Schnee',        'en' => 'snow',         'tags' => [$enNature->id]],
            ['de' => 'Spur',          'en' => 'track',        'tags' => [$enNature->id]],
            // Animals
            ['de' => 'Biber',         'en' => 'beaver',       'tags' => [$enAnimals->id]],
            ['de' => 'Büffel',        'en' => 'buffalo',      'tags' => [$enAnimals->id]],
            ['de' => 'Ente',          'en' => 'duck',         'tags' => [$enAnimals->id]],
            ['de' => 'Adler',         'en' => 'eagle',        'tags' => [$enAnimals->id]],
            ['de' => 'Gans',          'en' => 'goose',        'tags' => [$enAnimals->id]],
            ['de' => 'Elch',          'en' => 'moose',        'tags' => [$enAnimals->id]],
            ['de' => 'Schaf',         'en' => 'sheep',        'tags' => [$enAnimals->id]],
            // Camping
            ['de' => 'Taschenmesser', 'en' => 'pocket knife', 'tags' => [$enCamping->id]],
            ['de' => 'Rucksack',      'en' => 'rucksack',     'tags' => [$enCamping->id]],
            ['de' => 'Schlafsack',    'en' => 'sleeping bag', 'tags' => [$enCamping->id]],
            ['de' => 'Zelt',          'en' => 'tent',         'tags' => [$enCamping->id]],
            ['de' => 'Tipi',          'en' => 'teepee',       'tags' => [$enCamping->id]],
            ['de' => 'Taschenlampe',  'en' => 'torch',        'tags' => [$enCamping->id]],
            ['de' => 'Wasserflasche', 'en' => 'water bottle', 'tags' => [$enCamping->id]],
        ];

        foreach ($enVocabs as $v) {
            $vocab = Vocabulary::firstOrCreate(
                ['word_de' => $v['de'], 'parent_id' => $parent->id, 'vocabulary_list_id' => $fachEn->id],
                ['word_en' => $v['en'], 'word_fr' => null]
            );
            $vocab->tags()->syncWithoutDetaching($v['tags']);
        }

        // === Kind-Cluster-Zuweisung ===
        // Tobias → alle drei Cluster im Englisch-Fach
        $kind1->tags()->syncWithoutDetaching([$enNature->id, $enAnimals->id, $enCamping->id]);

        // Flash cards via tag-basierte Logik
        $leitner->createMissingCards($kind1->id, $parent->id);

        $this->command->info('Demo data seeded: jr@einsle.com');
        $this->command->info('Children: Tobias (PIN: 1234, Cluster: Nature+Animals+Camping in Englisch)');
    }
}
