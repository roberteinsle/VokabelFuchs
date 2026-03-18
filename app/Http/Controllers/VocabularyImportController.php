<?php

namespace App\Http\Controllers;

use App\Models\Vocabulary;
use App\Models\VocabularyList;
use App\Services\LeitnerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VocabularyImportController extends Controller
{
    public function __construct(private LeitnerService $leitner) {}

    public function create(VocabularyList $vocabularyList, Request $request): Response
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('Vocabulary/Import', [
            'list' => $vocabularyList->only('id', 'name', 'language_pair'),
            'tags' => $vocabularyList->tags()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(VocabularyList $vocabularyList, Request $request): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'file'   => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
            'tag_id' => ['nullable', 'integer', 'exists:tags,id'],
        ]);

        // Fallback tag_id from form (used when CSV row has no cluster column)
        $fallbackTagId = $request->tag_id ? (int) $request->tag_id : null;
        $autoTag       = null; // lazy: created on first unclustered row

        $targetField = $vocabularyList->language_pair === 'de_fr' ? 'word_fr' : 'word_en';

        $lines = file(
            $request->file('file')->getPathname(),
            FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES
        );

        $imported     = 0;
        $skipped      = 0;
        $tagCache     = []; // name → id, avoids repeated DB lookups

        foreach ($lines as $i => $line) {
            $parts = str_getcsv($line, ';');

            if (count($parts) < 2) {
                $skipped++;
                continue;
            }

            $de          = trim($parts[0]);
            $target      = trim($parts[1]);
            $clusterName = trim($parts[2] ?? '');

            // Skip header row
            if ($i === 0 && strtolower($de) === 'deutsch') {
                continue;
            }

            if ($de === '' || $target === '') {
                $skipped++;
                continue;
            }

            // Resolve cluster
            if ($clusterName !== '') {
                // Find or create cluster by name from CSV
                if (! isset($tagCache[$clusterName])) {
                    $tag = $vocabularyList->tags()->firstOrCreate(
                        ['name' => $clusterName],
                        ['parent_id' => $request->user()->id]
                    );
                    $tagCache[$clusterName] = $tag->id;
                }
                $resolvedTagId = $tagCache[$clusterName];
            } elseif ($fallbackTagId) {
                $resolvedTagId = $fallbackTagId;
            } else {
                // Create auto-cluster once for all unclustered rows
                if ($autoTag === null) {
                    $autoTag = $vocabularyList->tags()->create([
                        'name'      => 'import_' . time(),
                        'parent_id' => $request->user()->id,
                    ]);
                }
                $resolvedTagId = $autoTag->id;
            }

            $vocab = Vocabulary::firstOrCreate(
                [
                    'word_de'            => $de,
                    'parent_id'          => $request->user()->id,
                    'vocabulary_list_id' => $vocabularyList->id,
                ],
                [
                    $targetField => $target,
                    'is_active'  => true,
                ]
            );

            $vocab->tags()->syncWithoutDetaching([$resolvedTagId]);

            $imported++;
        }

        foreach ($request->user()->children as $child) {
            $this->leitner->createMissingCards($child->id, $request->user()->id);
        }

        $msg = "{$imported} Vokabeln importiert";
        if ($skipped > 0) {
            $msg .= ", {$skipped} Zeilen übersprungen";
        }

        return redirect()
            ->route('parent.vocabulary-lists.show', $vocabularyList->id)
            ->with('success', $msg . '.');
    }
}
