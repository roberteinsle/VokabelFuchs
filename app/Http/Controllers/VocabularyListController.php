<?php

namespace App\Http\Controllers;

use App\Enums\LanguagePair;
use App\Models\VocabularyList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VocabularyListController extends Controller
{
    public function index(Request $request): Response
    {
        $lists = $request->user()
            ->vocabularyLists()
            ->withCount('vocabularies')
            ->orderBy('name')
            ->get();

        return Inertia::render('VocabularyList/Index', [
            'lists'         => $lists,
            'languagePairs' => collect(LanguagePair::cases())->map(fn ($lp) => [
                'value' => $lp->value,
                'label' => $lp->label(),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'language_pair' => ['required', 'string', 'in:' . implode(',', array_column(LanguagePair::cases(), 'value'))],
            'description'   => ['nullable', 'string', 'max:500'],
        ]);

        $list = $request->user()->vocabularyLists()->create($validated);

        return redirect()->route('parent.vocabulary-lists.show', $list)
            ->with('success', 'Fach wurde angelegt.');
    }

    public function show(Request $request, VocabularyList $vocabularyList): Response
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }

        $vocabularies = $vocabularyList->vocabularies()
            ->with('tags')
            ->orderBy('word_de')
            ->get();

        $tags = $vocabularyList->tags()
            ->withCount('vocabularies')
            ->with('children:id,name')
            ->orderBy('name')
            ->get();

        $allChildren = $request->user()->children()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('VocabularyList/Show', [
            'list'         => $vocabularyList,
            'vocabularies' => $vocabularies,
            'tags'         => $tags,
            'allChildren'  => $allChildren,
        ]);
    }

    public function update(Request $request, VocabularyList $vocabularyList): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string', 'max:500'],
        ]);

        $vocabularyList->update($validated);

        return back()->with('success', 'Fach wurde aktualisiert.');
    }

    public function destroy(Request $request, VocabularyList $vocabularyList): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }

        $vocabularyList->delete();

        return redirect()->route('parent.vocabulary-lists.index')
            ->with('success', 'Fach wurde gelöscht.');
    }
}
