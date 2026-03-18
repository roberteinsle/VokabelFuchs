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

        $kind2 = Child::firstOrCreate(
            ['name' => 'Jonas', 'parent_id' => $parent->id],
            [
                'pin'           => '5678',
                'language_pair' => LanguagePair::DE_FR,
                'is_active'     => true,
            ]
        );

        // === FACH: Englisch (DE_EN) ===
        $fachEn = VocabularyList::firstOrCreate(
            ['name' => 'Englisch Klasse 4', 'parent_id' => $parent->id],
            ['language_pair' => LanguagePair::DE_EN->value]
        );

        // Tags für Englisch-Fach
        $enTags = collect(['Tiere', 'Essen', 'Farben', 'Schule', 'Familie', 'Zahlen'])
            ->map(fn ($name) => Tag::firstOrCreate(
                ['name' => $name, 'vocabulary_list_id' => $fachEn->id],
                ['parent_id' => $parent->id]
            ));

        $enTiere   = $enTags->firstWhere('name', 'Tiere');
        $enEssen   = $enTags->firstWhere('name', 'Essen');
        $enFarben  = $enTags->firstWhere('name', 'Farben');
        $enSchule  = $enTags->firstWhere('name', 'Schule');
        $enFamilie = $enTags->firstWhere('name', 'Familie');
        $enZahlen  = $enTags->firstWhere('name', 'Zahlen');

        // Vokabeln für Englisch-Fach
        $enVocabs = [
            ['de' => 'der Hund',     'en' => 'dog',       'tags' => [$enTiere->id]],
            ['de' => 'die Katze',    'en' => 'cat',        'tags' => [$enTiere->id]],
            ['de' => 'der Vogel',    'en' => 'bird',       'tags' => [$enTiere->id]],
            ['de' => 'das Pferd',    'en' => 'horse',      'tags' => [$enTiere->id]],
            ['de' => 'der Fisch',    'en' => 'fish',       'tags' => [$enTiere->id]],
            ['de' => 'der Apfel',    'en' => 'apple',      'tags' => [$enEssen->id]],
            ['de' => 'das Brot',     'en' => 'bread',      'tags' => [$enEssen->id]],
            ['de' => 'die Milch',    'en' => 'milk',       'tags' => [$enEssen->id]],
            ['de' => 'das Wasser',   'en' => 'water',      'tags' => [$enEssen->id]],
            ['de' => 'der Kuchen',   'en' => 'cake',       'tags' => [$enEssen->id]],
            ['de' => 'rot',          'en' => 'red',        'tags' => [$enFarben->id]],
            ['de' => 'blau',         'en' => 'blue',       'tags' => [$enFarben->id]],
            ['de' => 'grün',         'en' => 'green',      'tags' => [$enFarben->id]],
            ['de' => 'gelb',         'en' => 'yellow',     'tags' => [$enFarben->id]],
            ['de' => 'schwarz',      'en' => 'black',      'tags' => [$enFarben->id]],
            ['de' => 'das Buch',     'en' => 'book',       'tags' => [$enSchule->id]],
            ['de' => 'der Stift',    'en' => 'pen',        'tags' => [$enSchule->id]],
            ['de' => 'die Schule',   'en' => 'school',     'tags' => [$enSchule->id]],
            ['de' => 'der Lehrer',   'en' => 'teacher',    'tags' => [$enSchule->id]],
            ['de' => 'das Heft',     'en' => 'notebook',   'tags' => [$enSchule->id]],
            ['de' => 'die Mutter',   'en' => 'mother',     'tags' => [$enFamilie->id]],
            ['de' => 'der Vater',    'en' => 'father',     'tags' => [$enFamilie->id]],
            ['de' => 'die Schwester','en' => 'sister',     'tags' => [$enFamilie->id]],
            ['de' => 'der Bruder',   'en' => 'brother',    'tags' => [$enFamilie->id]],
            ['de' => 'eins',         'en' => 'one',        'tags' => [$enZahlen->id]],
            ['de' => 'zwei',         'en' => 'two',        'tags' => [$enZahlen->id]],
            ['de' => 'drei',         'en' => 'three',      'tags' => [$enZahlen->id]],
            ['de' => 'vier',         'en' => 'four',       'tags' => [$enZahlen->id]],
            ['de' => 'fünf',         'en' => 'five',       'tags' => [$enZahlen->id]],
        ];

        foreach ($enVocabs as $v) {
            $vocab = Vocabulary::firstOrCreate(
                ['word_de' => $v['de'], 'parent_id' => $parent->id, 'vocabulary_list_id' => $fachEn->id],
                ['word_en' => $v['en'], 'word_fr' => null]
            );
            $vocab->tags()->syncWithoutDetaching($v['tags']);
        }

        // === FACH: Französisch (DE_FR) ===
        $fachFr = VocabularyList::firstOrCreate(
            ['name' => 'Französisch Klasse 5', 'parent_id' => $parent->id],
            ['language_pair' => LanguagePair::DE_FR->value]
        );

        // Tags für Französisch-Fach
        $frTags = collect(['Tiere', 'Essen', 'Familie', 'Zahlen'])
            ->map(fn ($name) => Tag::firstOrCreate(
                ['name' => $name, 'vocabulary_list_id' => $fachFr->id],
                ['parent_id' => $parent->id]
            ));

        $frTiere   = $frTags->firstWhere('name', 'Tiere');
        $frEssen   = $frTags->firstWhere('name', 'Essen');
        $frFamilie = $frTags->firstWhere('name', 'Familie');
        $frZahlen  = $frTags->firstWhere('name', 'Zahlen');

        // Vokabeln für Französisch-Fach
        $frVocabs = [
            ['de' => 'der Hund',     'fr' => 'le chien',      'tags' => [$frTiere->id]],
            ['de' => 'die Katze',    'fr' => 'le chat',       'tags' => [$frTiere->id]],
            ['de' => 'der Vogel',    'fr' => 'l\'oiseau',     'tags' => [$frTiere->id]],
            ['de' => 'das Pferd',    'fr' => 'le cheval',     'tags' => [$frTiere->id]],
            ['de' => 'der Fisch',    'fr' => 'le poisson',    'tags' => [$frTiere->id]],
            ['de' => 'der Apfel',    'fr' => 'la pomme',      'tags' => [$frEssen->id]],
            ['de' => 'das Brot',     'fr' => 'le pain',       'tags' => [$frEssen->id]],
            ['de' => 'das Wasser',   'fr' => 'l\'eau',        'tags' => [$frEssen->id]],
            ['de' => 'der Kuchen',   'fr' => 'le gâteau',     'tags' => [$frEssen->id]],
            ['de' => 'die Mutter',   'fr' => 'la mère',       'tags' => [$frFamilie->id]],
            ['de' => 'der Vater',    'fr' => 'le père',       'tags' => [$frFamilie->id]],
            ['de' => 'die Schwester','fr' => 'la sœur',       'tags' => [$frFamilie->id]],
            ['de' => 'der Bruder',   'fr' => 'le frère',      'tags' => [$frFamilie->id]],
            ['de' => 'eins',         'fr' => 'un',            'tags' => [$frZahlen->id]],
            ['de' => 'zwei',         'fr' => 'deux',          'tags' => [$frZahlen->id]],
            ['de' => 'drei',         'fr' => 'trois',         'tags' => [$frZahlen->id]],
        ];

        foreach ($frVocabs as $v) {
            $vocab = Vocabulary::firstOrCreate(
                ['word_de' => $v['de'], 'parent_id' => $parent->id, 'vocabulary_list_id' => $fachFr->id],
                ['word_fr' => $v['fr'], 'word_en' => null]
            );
            $vocab->tags()->syncWithoutDetaching($v['tags']);
        }

        // === Kind-Cluster-Zuweisung ===
        // Lena → Tiere + Schule + Farben im Englisch-Fach
        $kind1->tags()->syncWithoutDetaching([$enTiere->id, $enSchule->id, $enFarben->id]);

        // Max → Tiere + Familie im Französisch-Fach
        $kind2->tags()->syncWithoutDetaching([$frTiere->id, $frFamilie->id]);

        // Flash cards via neue tag-basierte Logik
        $leitner->createMissingCards($kind1->id, $parent->id);
        $leitner->createMissingCards($kind2->id, $parent->id);

        $this->command->info('Demo data seeded: jr@einsle.com');
        $this->command->info('Children: Tobias (PIN: 1234, Cluster: Tiere+Schule+Farben in Englisch)');
        $this->command->info('         Jonas (PIN: 5678, Cluster: Tiere+Familie in Französisch)');
    }
}
