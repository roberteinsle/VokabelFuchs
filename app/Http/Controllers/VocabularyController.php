<?php

namespace App\Http\Controllers;

use App\Models\Vocabulary;
use App\Services\LeitnerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VocabularyController extends Controller
{
    public function __construct(private LeitnerService $leitner) {}

    public function index(Request $request): Response
    {
        $query = $request->user()->vocabularies()->with('tags');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('word_de', 'ilike', $search)
                  ->orWhere('word_en', 'ilike', $search)
                  ->orWhere('word_fr', 'ilike', $search);
            });
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $request->tag));
        }

        $vocabularies = $query->orderBy('word_de')->paginate(25)->withQueryString();
        $tags = $request->user()->tags()->orderBy('name')->get();

        return Inertia::render('Vocabulary/Index', [
            'vocabularies' => $vocabularies,
            'tags'         => $tags,
            'filters'      => $request->only(['search', 'tag']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Vocabulary/Create', [
            'tags' => $request->user()->tags()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'word_de'     => ['required', 'string', 'max:255'],
            'word_en'     => ['nullable', 'string', 'max:255'],
            'word_fr'     => ['nullable', 'string', 'max:255'],
            'sentence_de' => ['nullable', 'string', 'max:500'],
            'sentence_en' => ['nullable', 'string', 'max:500'],
            'sentence_fr' => ['nullable', 'string', 'max:500'],
            'tag_ids'     => ['nullable', 'array'],
            'tag_ids.*'   => ['integer', 'exists:tags,id'],
        ]);

        $vocabulary = $request->user()->vocabularies()->create($validated);

        if (! empty($validated['tag_ids'])) {
            $vocabulary->tags()->sync($validated['tag_ids']);
        }

        // Auto-create flash cards for all children of this parent
        foreach ($request->user()->children as $child) {
            $this->leitner->createMissingCards($child->id, $request->user()->id);
        }

        return redirect()->route('parent.vocabulary.index')
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
            'tags'       => $request->user()->tags()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Vocabulary $vocabulary): RedirectResponse
    {
        if ($vocabulary->parent_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'word_de'     => ['required', 'string', 'max:255'],
            'word_en'     => ['nullable', 'string', 'max:255'],
            'word_fr'     => ['nullable', 'string', 'max:255'],
            'sentence_de' => ['nullable', 'string', 'max:500'],
            'sentence_en' => ['nullable', 'string', 'max:500'],
            'sentence_fr' => ['nullable', 'string', 'max:500'],
            'tag_ids'     => ['nullable', 'array'],
            'tag_ids.*'   => ['integer', 'exists:tags,id'],
        ]);

        $vocabulary->update($validated);
        $vocabulary->tags()->sync($validated['tag_ids'] ?? []);

        return redirect()->route('parent.vocabulary.index')
            ->with('success', 'Vokabel wurde aktualisiert.');
    }

    public function destroy(Request $request, Vocabulary $vocabulary): RedirectResponse
    {
        if ($vocabulary->parent_id !== $request->user()->id) {
            abort(403);
        }

        $vocabulary->delete();

        return redirect()->route('parent.vocabulary.index')
            ->with('success', 'Vokabel wurde gelöscht.');
    }
}
