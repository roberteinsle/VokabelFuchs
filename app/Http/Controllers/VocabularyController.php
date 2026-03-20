<?php

namespace App\Http\Controllers;

use App\Models\Vocabulary;
use App\Models\VocabularyList;
use App\Services\LeitnerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VocabularyController extends Controller
{
    public function __construct(private LeitnerService $leitner) {}

    public function create(Request $request): Response
    {
        $listId = $request->query('list_id');
        $list = null;

        if ($listId) {
            $list = VocabularyList::where('id', $listId)
                ->where('parent_id', $request->user()->id)
                ->firstOrFail();
        }

        return Inertia::render('Vocabulary/Create', [
            'list' => $list,
            'tags' => $request->user()->tags()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vocabulary_list_id' => ['nullable', 'integer', 'exists:vocabulary_lists,id'],
            'word_de' => ['required', 'string', 'max:255'],
            'word_en' => ['nullable', 'string', 'max:255'],
            'word_fr' => ['nullable', 'string', 'max:255'],
            'sentence_de' => ['nullable', 'string', 'max:500'],
            'sentence_en' => ['nullable', 'string', 'max:500'],
            'sentence_fr' => ['nullable', 'string', 'max:500'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ]);

        $vocabulary = $request->user()->vocabularies()->create($validated);

        if (! empty($validated['tag_ids'])) {
            $vocabulary->tags()->sync($validated['tag_ids']);
        }

        foreach ($request->user()->children as $child) {
            $this->leitner->createMissingCards($child->id, $request->user()->id);
        }

        if ($validated['vocabulary_list_id'] ?? null) {
            return redirect()->route('parent.vocabulary-lists.show', $validated['vocabulary_list_id'])
                ->with('success', 'Vokabel wurde angelegt.');
        }

        return redirect()->route('parent.vocabulary-lists.index')
            ->with('success', 'Vokabel wurde angelegt.');
    }

    public function edit(Request $request, Vocabulary $vocabulary): Response
    {
        if ($vocabulary->parent_id !== $request->user()->id) {
            abort(403);
        }

        $vocabulary->load('tags');

        return Inertia::render('Vocabulary/Edit', [
            'vocabulary' => $vocabulary,
            'list' => $vocabulary->vocabularyList,
            'tags' => $request->user()->tags()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Vocabulary $vocabulary): RedirectResponse
    {
        if ($vocabulary->parent_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'word_de' => ['required', 'string', 'max:255'],
            'word_en' => ['nullable', 'string', 'max:255'],
            'word_fr' => ['nullable', 'string', 'max:255'],
            'sentence_de' => ['nullable', 'string', 'max:500'],
            'sentence_en' => ['nullable', 'string', 'max:500'],
            'sentence_fr' => ['nullable', 'string', 'max:500'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ]);

        $vocabulary->update($validated);
        $vocabulary->tags()->sync($validated['tag_ids'] ?? []);

        if ($vocabulary->vocabulary_list_id) {
            return redirect()->route('parent.vocabulary-lists.show', $vocabulary->vocabulary_list_id)
                ->with('success', 'Vokabel wurde aktualisiert.');
        }

        return redirect()->route('parent.vocabulary-lists.index')
            ->with('success', 'Vokabel wurde aktualisiert.');
    }

    public function destroy(Request $request, Vocabulary $vocabulary): RedirectResponse
    {
        if ($vocabulary->parent_id !== $request->user()->id) {
            abort(403);
        }

        $listId = $vocabulary->vocabulary_list_id;
        $vocabulary->delete();

        if ($listId) {
            return redirect()->route('parent.vocabulary-lists.show', $listId)
                ->with('success', 'Vokabel wurde gelöscht.');
        }

        return redirect()->route('parent.vocabulary-lists.index')
            ->with('success', 'Vokabel wurde gelöscht.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:vocabularies,id'],
        ]);

        $vocabs = Vocabulary::whereIn('id', $validated['ids'])
            ->where('parent_id', $request->user()->id)
            ->get();

        $listId = $vocabs->first()?->vocabulary_list_id;

        foreach ($vocabs as $vocab) {
            $vocab->delete();
        }

        if ($listId) {
            return redirect()->route('parent.vocabulary-lists.show', $listId)
                ->with('success', $vocabs->count().' Vokabeln gelöscht.');
        }

        return redirect()->route('parent.vocabulary-lists.index')
            ->with('success', $vocabs->count().' Vokabeln gelöscht.');
    }

    public function generateImage(Request $request, Vocabulary $vocabulary): JsonResponse
    {
        if ($vocabulary->parent_id !== $request->user()->id) {
            abort(403);
        }

        $apiKey = $request->user()->google_tts_api_key;
        if (! $apiKey) {
            return response()->json(['error' => 'Kein Google Cloud API-Key hinterlegt (siehe Profil → Sprachausgabe).'], 422);
        }

        $word = $vocabulary->word_de;
        $prompt = "Generate an 8-bit pixel art image of a small {$word} in Minecraft style.";

        $response = Http::timeout(30)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={$apiKey}",
            [
                'instances' => [['prompt' => $prompt]],
                'parameters' => [
                    'sampleCount' => 1,
                    'aspectRatio' => '1:1',
                ],
            ]
        );

        if ($response->failed()) {
            $message = $response->json('error.message') ?? 'Bildgenerierung fehlgeschlagen';

            return response()->json(['error' => $message], $response->status());
        }

        $imageBase64 = $response->json('predictions.0.bytesBase64Encoded');
        if (! $imageBase64) {
            return response()->json(['error' => 'Kein Bild erhalten.'], 500);
        }

        $imageData = base64_decode($imageBase64);
        $filename = "vocab-images/{$vocabulary->id}_".time().'.png';

        Storage::disk('public')->put($filename, $imageData);

        $vocabulary->update(['image_path' => "/storage/{$filename}"]);

        return response()->json([
            'image_path' => "/storage/{$filename}",
        ]);
    }

    public function bulkAssignTag(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:vocabularies,id'],
            'tag_id' => ['required', 'integer', 'exists:tags,id'],
        ]);

        $vocabs = Vocabulary::whereIn('id', $validated['ids'])
            ->where('parent_id', $request->user()->id)
            ->get();

        $listId = $vocabs->first()?->vocabulary_list_id;

        foreach ($vocabs as $vocab) {
            $vocab->tags()->syncWithoutDetaching([$validated['tag_id']]);
        }

        foreach ($request->user()->children as $child) {
            $this->leitner->createMissingCards($child->id, $request->user()->id);
        }

        if ($listId) {
            return redirect()->route('parent.vocabulary-lists.show', $listId)
                ->with('success', 'Cluster wurde zugewiesen.');
        }

        return redirect()->route('parent.vocabulary-lists.index')
            ->with('success', 'Cluster wurde zugewiesen.');
    }
}
