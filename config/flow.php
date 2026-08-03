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

    /*
    | Official Twilio ConversationRelay ElevenLabs defaults by language.
    | Used for Builder preview / docs — runtime omits empty voice so Twilio applies these.
    | es-MX maps to Twilio's es-US default (no es-MX row in Twilio table).
    | @see https://www.twilio.com/docs/voice/conversationrelay/voice-configuration
    */
    'elevenlabs_voices' => [
        'bg-BG' => 'AB9XsbSA4eLG12t2myjN',
        'cs-CZ' => 'uYFJyGaibp4N2VwYQshk',
        'da-DK' => 'ygiXC2Oa1BiHksD3WkJZ',
        'de-DE' => 'FTNCalFNG5bRnkkaP5Ug',
        'en-AU' => '9Ft9sm9dzvprPILZmLJl',
        'en-GB' => 'Fahco4VZzobUeiPqni1S',
        'en-IN' => 'mCQMfsqGDT6IDkEKR20a',
        'en-US' => 'UgBBYS2sOqTuMpoF3BR0',
        'es-ES' => '6xftrpatV0jGmFHxDjUv',
        'es-US' => 'CaJslL1xziwefCeTNzHv',
        'es-MX' => 'CaJslL1xziwefCeTNzHv',
        'fi-FI' => '6xPz2opT0y5qtoRh1U1Y',
        'fr-CA' => 'IPgYtHTNLjC7Bq7IPHrm',
        'fr-FR' => 'a5n9pJUnAhX4fn7lx3uo',
        'hi-IN' => 'IvLWq57RKibBrqZGpQrC',
        'hu-HU' => 'TumdjBNWanlT3ysvclWh',
        'id-ID' => '1k39YpzqXZn52BgyLyGO',
        'it-IT' => 'uScy1bXtKz8vPzfdFsFw',
        'ja-JP' => '3JDquces8E8bkmvbh6Bc',
        'ko-KR' => 'uyVNoMrnUku1dZyVEXwD',
        'nl-BE' => 's7Z6uboUuE4Nd8Q2nye6',
        'nl-NL' => 'UNBIyLbtFB9k7FKW8wJv',
        'pl-PL' => 'W0sqKm1Sfw1EzlCH14FQ',
        'pt-BR' => 'CstacWqMhJQlnfLPxRG4',
        'pt-PT' => 'TsZfI8Nbn2Xd7ArC76n9',
        'ro-RO' => 'OlBp4oyr3FBAGEAtJOnU',
        'ru-RU' => 'AB9XsbSA4eLG12t2myjN',
        'sv-SE' => '4xkUqaR9MYOJHoaC1Nak',
        'ta-IN' => 'ZhJ5LanYnCmLKQUXvsV7',
        'tr-TR' => 'IuRRIAcbQK5AQk1XevPj',
        'uk-UA' => 'nCqaTnIbLdME87OuQaZY',
        'vi-VN' => 'foH7s9fX31wFFH2yqrFa',
    ],
];
