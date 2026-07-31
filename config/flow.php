<?php

return [
    'languages' => [
        'en-US' => 'English (US)',
        'es-ES' => 'Español (España)',
        'es-MX' => 'Español (México)',
        'de-DE' => 'Deutsch',
        'fr-FR' => 'Français',
        'it-IT' => 'Italiano',
        'pt-BR' => 'Português (Brasil)',
        'pt-PT' => 'Português (Portugal)',
    ],

    /*
    | Default Twilio <Say> voice per BCP-47 language.
    | language alone is not enough — account default voice is often English.
    | @see https://www.twilio.com/docs/voice/twiml/say/text-speech
    */
    'voices' => [
        'en-US' => 'Polly.Joanna',
        'es-ES' => 'Polly.Lucia',
        'es-MX' => 'Polly.Mia',
        'de-DE' => 'Polly.Vicki',
        'fr-FR' => 'Polly.Lea',
        'it-IT' => 'Polly.Bianca',
        'pt-BR' => 'Polly.Camila',
        'pt-PT' => 'Polly.Ines',
    ],

    'default_language' => 'en-US',
    'default_voice' => 'Polly.Joanna',
];
