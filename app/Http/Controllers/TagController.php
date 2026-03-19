<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\VocabularyList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function store(Request $request, VocabularyList $vocabularyList): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $vocabularyList->tags()->firstOrCreate([
            'name' => $validated['name'],
            'parent_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Cluster wurde angelegt.');
    }

    public function update(Request $request, VocabularyList $vocabularyList, Tag $tag): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id || $tag->vocabulary_list_id !== $vocabularyList->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $tag->update($validated);

        return back()->with('success', 'Cluster umbenannt.');
    }

    public function destroy(Request $request, VocabularyList $vocabularyList, Tag $tag): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }
        if ($tag->vocabulary_list_id !== $vocabularyList->id) {
            abort(403);
        }

        $tag->delete();

        return back()->with('success', 'Cluster wurde gelöscht.');
    }
}
