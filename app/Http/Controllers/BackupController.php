<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\FlashCard;
use App\Models\MediaTimeRule;
use App\Models\Tag;
use App\Models\Vocabulary;
use App\Models\VocabularyList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BackupController extends Controller
{
    public function export(Request $request): Response
    {
        $user = $request->user();

        $data = [
            'version'     => '1.0',
            'exported_at' => now()->toIso8601String(),
            'user'        => [
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'media_time_rules' => $user->mediaTimeRule ? [
                'minutes_learn_per_gaming'  => $user->mediaTimeRule->minutes_learn_per_gaming,
                'minutes_learn_per_youtube' => $user->mediaTimeRule->minutes_learn_per_youtube,
                'daily_cap_gaming'          => $user->mediaTimeRule->daily_cap_gaming,
                'daily_cap_youtube'         => $user->mediaTimeRule->daily_cap_youtube,
                'min_learn_for_unlock'      => $user->mediaTimeRule->min_learn_for_unlock,
            ] : null,
            'vocabulary_lists' => $user->vocabularyLists()
                ->with(['tags', 'vocabularies.tags'])
                ->get()
                ->map(fn ($list) => [
                    'name'          => $list->name,
                    'language_pair' => $list->language_pair,
                    'description'   => $list->description,
                    'tags'          => $list->tags->pluck('name'),
                    'vocabularies'  => $list->vocabularies->map(fn ($v) => [
                        'word_de'     => $v->word_de,
                        'word_en'     => $v->word_en,
                        'word_fr'     => $v->word_fr,
                        'sentence_de' => $v->sentence_de,
                        'sentence_en' => $v->sentence_en,
                        'sentence_fr' => $v->sentence_fr,
                        'is_active'   => $v->is_active,
                        'tags'        => $v->tags->pluck('name'),
                    ]),
                ]),
            'children' => $user->children()
                ->with(['tags.vocabularyList', 'flashCards.vocabulary.vocabularyList', 'flashCards.vocabulary.tags'])
                ->get()
                ->map(fn ($child) => [
                    'name'               => $child->name,
                    'pin'                => $child->pin,
                    'is_active'          => $child->is_active,
                    'assigned_clusters'  => $child->tags->map(fn ($tag) => [
                        'list' => $tag->vocabularyList->name,
                        'tag'  => $tag->name,
                    ]),
                    'flash_cards' => $child->flashCards
                        ->filter(fn ($c) => $c->vocabulary?->vocabularyList !== null)
                        ->map(fn ($c) => [
                            'list'             => $c->vocabulary->vocabularyList->name,
                            'word_de'          => $c->vocabulary->word_de,
                            'word_en'          => $c->vocabulary->word_en,
                            'word_fr'          => $c->vocabulary->word_fr,
                            'clusters'         => $c->vocabulary->tags->pluck('name'),
                            'drawer'           => $c->drawer,
                            'next_review_date' => $c->next_review_date,
                            'streak_count'     => $c->streak_count,
                        ])
                        ->values(),
                ]),
        ];

        $json     = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $filename = 'vokabelfuchs-backup-' . now()->format('Y-m-d') . '.json';

        return response($json, 200, [
            'Content-Type'        => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json,txt', 'max:20480'],
        ]);

        $json = file_get_contents($request->file('file')->getPathname());
        $data = json_decode($json, true);

        if (! $data || ($data['version'] ?? null) !== '1.0') {
            return back()->withErrors(['file' => 'Ungültiges oder veraltetes Backup-Format.']);
        }

        $user = $request->user();

        // Media time rules
        if (! empty($data['media_time_rules'])) {
            MediaTimeRule::updateOrCreate(
                ['parent_id' => $user->id],
                $data['media_time_rules']
            );
        }

        // Vocabulary lists + tags + vocabularies
        $listMap = [];

        foreach ($data['vocabulary_lists'] ?? [] as $listData) {
            $list = VocabularyList::firstOrCreate(
                ['name' => $listData['name'], 'parent_id' => $user->id],
                ['language_pair' => $listData['language_pair'], 'description' => $listData['description'] ?? null]
            );
            $listMap[$listData['name']] = $list;

            // Tags
            $tagMap = [];
            foreach ($listData['tags'] ?? [] as $tagName) {
                $tag            = Tag::firstOrCreate(
                    ['name' => $tagName, 'vocabulary_list_id' => $list->id],
                    ['parent_id' => $user->id]
                );
                $tagMap[$tagName] = $tag;
            }

            // Vocabularies
            foreach ($listData['vocabularies'] ?? [] as $vd) {
                $vocab = Vocabulary::firstOrCreate(
                    ['word_de' => $vd['word_de'], 'parent_id' => $user->id, 'vocabulary_list_id' => $list->id],
                    [
                        'word_en'     => $vd['word_en'] ?? null,
                        'word_fr'     => $vd['word_fr'] ?? null,
                        'sentence_de' => $vd['sentence_de'] ?? null,
                        'sentence_en' => $vd['sentence_en'] ?? null,
                        'sentence_fr' => $vd['sentence_fr'] ?? null,
                        'is_active'   => $vd['is_active'] ?? true,
                    ]
                );

                $tagIds = collect($vd['tags'] ?? [])
                    ->map(fn ($n) => $tagMap[$n]->id ?? null)
                    ->filter()
                    ->toArray();

                if (! empty($tagIds)) {
                    $vocab->tags()->syncWithoutDetaching($tagIds);
                }
            }
        }

        // Children + cluster assignments + flash cards
        foreach ($data['children'] ?? [] as $childData) {
            $child = Child::firstOrCreate(
                ['name' => $childData['name'], 'parent_id' => $user->id],
                ['pin' => $childData['pin'], 'is_active' => $childData['is_active'] ?? true]
            );

            $clusterIds = [];
            foreach ($childData['assigned_clusters'] ?? [] as $a) {
                $list = $listMap[$a['list']] ?? null;
                if (! $list) continue;
                $tag = Tag::where('name', $a['tag'])->where('vocabulary_list_id', $list->id)->first();
                if ($tag) $clusterIds[] = $tag->id;
            }
            if (! empty($clusterIds)) {
                $child->tags()->syncWithoutDetaching($clusterIds);
            }

            foreach ($childData['flash_cards'] ?? [] as $cd) {
                $list  = $listMap[$cd['list']] ?? null;
                if (! $list) continue;
                $vocab = Vocabulary::where('word_de', $cd['word_de'])
                    ->where('vocabulary_list_id', $list->id)
                    ->where('parent_id', $user->id)
                    ->first();
                if (! $vocab) continue;

                FlashCard::firstOrCreate(
                    ['vocabulary_id' => $vocab->id, 'child_id' => $child->id],
                    [
                        'drawer'           => $cd['drawer'],
                        'next_review_date' => $cd['next_review_date'],
                        'streak_count'     => $cd['streak_count'] ?? 0,
                    ]
                );
            }
        }

        return back()->with('status', 'backup-restored');
    }
}
