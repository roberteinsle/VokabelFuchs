<?php

namespace App\Services;

use App\Models\FlashCard;
use App\Models\Vocabulary;

class TrainingService
{
    /**
     * Generate multiple choice options for a given flash card.
     * Returns array of 4 items: [correct answer + 3 wrong answers], shuffled.
     */
    public function generateMultipleChoiceOptions(FlashCard $card, string $targetLang): array
    {
        $correct = $card->vocabulary->getWordForLang($targetLang);
        $wordField = 'word_' . $targetLang;

        // Fetch wrong options from sibling vocabularies of the same parent
        $wrongOptions = Vocabulary::where('parent_id', $card->vocabulary->parent_id)
            ->where('id', '!=', $card->vocabulary_id)
            ->whereNotNull($wordField)
            ->inRandomOrder()
            ->limit(config('leitner.multiple_choice_options', 3))
            ->pluck($wordField)
            ->toArray();

        // Pad with generic wrong options if not enough vocabulary exists
        while (count($wrongOptions) < 3) {
            $wrongOptions[] = '???';
        }

        $options = array_merge([$correct], $wrongOptions);
        shuffle($options);

        return array_values(array_unique($options));
    }

    /**
     * Build the question data for a flash card based on training mode.
     */
    public function buildQuestion(FlashCard $card, string $sourceLang, string $targetLang, string $mode): array
    {
        $vocab = $card->vocabulary;

        $baseData = [
            'flash_card_id' => $card->id,
            'mode'          => $mode,
            'source_lang'   => $sourceLang,
            'target_lang'   => $targetLang,
            'prompt'        => $vocab->getWordForLang($sourceLang),
            'sentence'      => $vocab->getSentenceForLang($sourceLang),
            'image_path'    => $vocab->image_path,
            'drawer'        => $card->drawer,
        ];

        if ($mode === 'multiple_choice') {
            $baseData['options'] = $this->generateMultipleChoiceOptions($card, $targetLang);
        }

        return $baseData;
    }
}
