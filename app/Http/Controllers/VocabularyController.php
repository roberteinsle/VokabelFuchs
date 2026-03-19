<?php

namespace App\Http\Controllers;

use App\Models\Vocabulary;
use App\Models\VocabularyList;
use App\Services\LeitnerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
