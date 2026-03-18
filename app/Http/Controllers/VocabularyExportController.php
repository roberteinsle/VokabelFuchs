<?php

namespace App\Http\Controllers;

use App\Models\VocabularyList;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VocabularyExportController extends Controller
{
    public function __invoke(VocabularyList $vocabularyList, Request $request): StreamedResponse
    {
        if ($vocabularyList->parent_id !== $request->user()->id) {
            abort(403);
        }

        $targetField = $vocabularyList->language_pair === 'de_fr' ? 'word_fr' : 'word_en';
        $targetLabel = $vocabularyList->language_pair === 'de_fr' ? 'französisch' : 'englisch';

        $vocabularies = $vocabularyList->vocabularies()
            ->with('tags')
            ->where('is_active', true)
            ->orderBy('word_de')
            ->get();

        $filename = Str::slug($vocabularyList->name) . '.csv';

        return response()->streamDownload(function () use ($vocabularies, $targetField, $targetLabel) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['deutsch', $targetLabel, 'cluster'], ';');

            foreach ($vocabularies as $vocab) {
                $target = $vocab->{$targetField} ?? '';

                if ($vocab->tags->isEmpty()) {
                    fputcsv($handle, [$vocab->word_de, $target, ''], ';');
                } else {
                    foreach ($vocab->tags as $tag) {
                        fputcsv($handle, [$vocab->word_de, $target, $tag->name], ';');
                    }
                }
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
