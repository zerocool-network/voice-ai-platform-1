<?php

return [
    'default' => env('TRANSCRIPTION_SERVICE', 'deepgram'),

    'deepgram' => [
        'api_key' => env('DEEPGRAM_API_KEY'),
        'model' => env('DEEPGRAM_MODEL', 'nova-2-general'),
        'language' => env('DEEPGRAM_LANGUAGE', 'en'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
    ],
];
