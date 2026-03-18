<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\Tag;
use App\Models\VocabularyList;
use App\Services\LeitnerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ChildTagController extends Controller
{
    public function __construct(private LeitnerService $leitner) {}

    public function store(Request $request, VocabularyList $vocabularyList, Tag $tag): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }
        if ($tag->vocabulary_list_id !== $vocabularyList->id) {
            abort(403);
        }

        $validated = $request->validate([
            'child_id' => ['required', 'integer', 'exists:children,id'],
        ]);

        $child = Child::where('id', $validated['child_id'])
            ->where('parent_id', $request->user()->id)
            ->firstOrFail();

        $tag->children()->syncWithoutDetaching([$child->id]);

        // Create flash cards for newly assigned vocab
        $this->leitner->createMissingCards($child->id, $request->user()->id);

        return back()->with('success', "{$child->name} wurde dem Cluster \"{$tag->name}\" hinzugefügt.");
    }

    public function destroy(Request $request, VocabularyList $vocabularyList, Tag $tag, Child $child): RedirectResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }
        if ($tag->vocabulary_list_id !== $vocabularyList->id) {
            abort(403);
        }
        if ($child->parent_id !== $request->user()->id) {
            abort(403);
        }

        $tag->children()->detach($child->id);

        return back()->with('success', "{$child->name} wurde aus dem Cluster \"{$tag->name}\" entfernt.");
    }
}
