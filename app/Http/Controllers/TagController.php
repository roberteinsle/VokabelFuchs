<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function index(Request $request): Response
    {
        $tags = $request->user()->tags()
            ->withCount('vocabularies')
            ->orderBy('name')
            ->get();

        return Inertia::render('Tags/Index', ['tags' => $tags]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $request->user()->tags()->firstOrCreate(
            ['name' => $validated['name'], 'parent_id' => $request->user()->id]
        );

        return back()->with('success', 'Tag wurde angelegt.');
    }

    public function destroy(Request $request, Tag $tag): RedirectResponse
    {
        if ($tag->parent_id !== $request->user()->id) {
            abort(403);
        }

        $tag->delete();

        return back()->with('success', 'Tag wurde gelöscht.');
    }
}
