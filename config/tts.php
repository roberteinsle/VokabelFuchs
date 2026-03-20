<?php

return [
    'default_model' => 'Wavenet',
    'default_voice_de' => 'de-DE-Wavenet-C',
    'default_voice_en' => 'en-GB-Wavenet-A',
    'default_voice_fr' => 'fr-FR-Wavenet-A',

    'voices' => [
        'de' => [
            'Wavenet' => ['de-DE-Wavenet-A', 'de-DE-Wavenet-B', 'de-DE-Wavenet-C', 'de-DE-Wavenet-D', 'de-DE-Wavenet-E', 'de-DE-Wavenet-F'],
            'Neural2' => ['de-DE-Neural2-A', 'de-DE-Neural2-B', 'de-DE-Neural2-C', 'de-DE-Neural2-D', 'de-DE-Neural2-F'],
            'Standard' => ['de-DE-Standard-A', 'de-DE-Standard-B', 'de-DE-Standard-C', 'de-DE-Standard-D', 'de-DE-Standard-E', 'de-DE-Standard-F'],
        ],
        'en' => [
            'Wavenet' => ['en-GB-Wavenet-A', 'en-GB-Wavenet-B', 'en-GB-Wavenet-C', 'en-GB-Wavenet-D', 'en-GB-Wavenet-F'],
            'Neural2' => ['en-GB-Neural2-A', 'en-GB-Neural2-B', 'en-GB-Neural2-C', 'en-GB-Neural2-D', 'en-GB-Neural2-F'],
            'Standard' => ['en-GB-Standard-A', 'en-GB-Standard-B', 'en-GB-Standard-C', 'en-GB-Standard-D', 'en-GB-Standard-F'],
        ],
        'fr' => [
            'Wavenet' => ['fr-FR-Wavenet-A', 'fr-FR-Wavenet-B', 'fr-FR-Wavenet-C', 'fr-FR-Wavenet-D', 'fr-FR-Wavenet-E', 'fr-FR-Wavenet-F', 'fr-FR-Wavenet-G'],
            'Neural2' => ['fr-FR-Neural2-A', 'fr-FR-Neural2-B', 'fr-FR-Neural2-C', 'fr-FR-Neural2-D', 'fr-FR-Neural2-E'],
            'Standard' => ['fr-FR-Standard-A', 'fr-FR-Standard-B', 'fr-FR-Standard-C', 'fr-FR-Standard-D', 'fr-FR-Standard-E'],
        ],
    ],

    'language_codes' => [
        'de' => 'de-DE',
        'en' => 'en-GB',
        'fr' => 'fr-FR',
    ],
];
