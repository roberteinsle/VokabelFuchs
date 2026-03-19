<?php

namespace App\Http\Controllers;

use App\Enums\LanguagePair;
use App\Models\Child;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    public function index(Request $request): Response
    {
        $children = $request->user()->children()->withCount('tags')->orderBy('name')->get();

        return Inertia::render('Children/Index', [
            'children' => $children,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Children/Create', [
            'language_pairs' => collect(LanguagePair::cases())->map(fn ($lp) => [
                'value' => $lp->value,
                'label' => $lp->label(),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'pin' => ['required', 'string', 'size:4', 'regex:/^\d{4}$/'],
            'language_pair' => ['required', 'string', 'in:'.implode(',', array_column(LanguagePair::cases(), 'value'))],
        ]);

        $request->user()->children()->create([
            'name' => $validated['name'],
            'pin' => Hash::make($validated['pin']),
            'language_pair' => $validated['language_pair'],
        ]);

        return redirect()->route('parent.children.index')
            ->with('success', 'Kind wurde erfolgreich angelegt.');
    }

    public function show(Request $request, Child $child): Response
    {
        $this->authorizeChild($request, $child);

        $child->load('flashCards');

        return Inertia::render('Children/Show', [
            'child' => $child,
        ]);
    }

    public function edit(Request $request, Child $child): Response
    {
        $this->authorizeChild($request, $child);

        return Inertia::render('Children/Edit', [
            'child' => $child,
            'language_pairs' => collect(LanguagePair::cases())->map(fn ($lp) => [
                'value' => $lp->value,
                'label' => $lp->label(),
            ]),
        ]);
    }

    public function update(Request $request, Child $child): RedirectResponse
    {
        $this->authorizeChild($request, $child);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'language_pair' => ['required', 'string', 'in:'.implode(',', array_column(LanguagePair::cases(), 'value'))],
            'pin' => ['nullable', 'string', 'size:4', 'regex:/^\d{4}$/'],
        ]);

        $data = [
            'name' => $validated['name'],
            'language_pair' => $validated['language_pair'],
        ];

        if (! empty($validated['pin'])) {
            $data['pin'] = Hash::make($validated['pin']);
        }

        $child->update($data);

        return redirect()->route('parent.children.index')
            ->with('success', 'Kind wurde aktualisiert.');
    }

    public function destroy(Request $request, Child $child): RedirectResponse
    {
        $this->authorizeChild($request, $child);
        $child->delete();

        return redirect()->route('parent.children.index')
            ->with('success', 'Kind wurde gelöscht.');
    }

    private function authorizeChild(Request $request, Child $child): void
    {
        if ($child->parent_id !== $request->user()->id) {
            abort(403);
        }
    }
}
