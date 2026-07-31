<?php

namespace App\Application\Flow\Services;

/**
 * Normalizes stored flow language codes to Twilio BCP-47 for Say/Gather/ConversationRelay.
 *
 * @see https://www.twilio.com/docs/voice/twiml/say
 */
final class FlowSpeechLocale
{
    private const SHORT_TO_BCP47 = [
        'en' => 'en-US',
        'es' => 'es-ES',
        'de' => 'de-DE',
        'fr' => 'fr-FR',
        'it' => 'it-IT',
        'pt' => 'pt-BR',
    ];

    private const FALLBACK_LANGUAGES = [
        'en-US' => 'English (US)',
        'es-ES' => 'Español (España)',
        'es-MX' => 'Español (México)',
        'de-DE' => 'Deutsch',
        'fr-FR' => 'Français',
        'it-IT' => 'Italiano',
        'pt-BR' => 'Português (Brasil)',
        'pt-PT' => 'Português (Portugal)',
    ];

    private const FALLBACK_VOICES = [
        'en-US' => 'Polly.Joanna',
        'es-ES' => 'Polly.Lucia',
        'es-MX' => 'Polly.Mia',
        'de-DE' => 'Polly.Vicki',
        'fr-FR' => 'Polly.Lea',
        'it-IT' => 'Polly.Bianca',
        'pt-BR' => 'Polly.Camila',
        'pt-PT' => 'Polly.Ines',
    ];

    public static function bcp47(?string $stored): string
    {
        $default = self::defaultLanguage();

        if ($stored === null || trim($stored) === '') {
            return $default;
        }

        $normalized = str_replace('_', '-', trim($stored));

        if (isset(self::SHORT_TO_BCP47[strtolower($normalized)])) {
            return self::SHORT_TO_BCP47[strtolower($normalized)];
        }

        foreach (array_keys(self::languages()) as $code) {
            if (strcasecmp((string) $code, $normalized) === 0) {
                return (string) $code;
            }
        }

        $primary = strtolower(explode('-', $normalized)[0] ?? '');

        if (isset(self::SHORT_TO_BCP47[$primary])) {
            return self::SHORT_TO_BCP47[$primary];
        }

        return $default;
    }

    /**
     * Twilio <Say> voice for a stored/BCP-47 language (Polly.*).
     * Required so Spanish text is not spoken with an English account-default voice.
     */
    public static function voice(?string $stored): string
    {
        $locale = self::bcp47($stored);
        $voices = self::voices();

        return $voices[$locale] ?? self::defaultVoice();
    }

    /**
     * Attributes for Twilio <Say>: language + matching voice.
     *
     * @return array{language: string, voice: string}
     */
    public static function sayAttributes(?string $stored): array
    {
        return [
            'language' => self::bcp47($stored),
            'voice' => self::voice($stored),
        ];
    }

    /** @return list<string> */
    public static function allowed(): array
    {
        return array_keys(self::languages());
    }

    public static function fromAppLocale(?string $appLocale): string
    {
        return self::bcp47($appLocale);
    }

    /** @return array<string, string> */
    private static function languages(): array
    {
        if (self::configAvailable()) {
            $configured = config('flow.languages');

            if (is_array($configured) && $configured !== []) {
                /** @var array<string, string> $configured */
                return $configured;
            }
        }

        return self::FALLBACK_LANGUAGES;
    }

    private static function defaultLanguage(): string
    {
        if (self::configAvailable()) {
            $configured = config('flow.default_language');

            if (is_string($configured) && $configured !== '') {
                return $configured;
            }
        }

        return 'en-US';
    }

    /** @return array<string, string> */
    private static function voices(): array
    {
        if (self::configAvailable()) {
            $configured = config('flow.voices');

            if (is_array($configured) && $configured !== []) {
                /** @var array<string, string> $configured */
                return $configured;
            }
        }

        return self::FALLBACK_VOICES;
    }

    private static function defaultVoice(): string
    {
        if (self::configAvailable()) {
            $configured = config('flow.default_voice');

            if (is_string($configured) && $configured !== '') {
                return $configured;
            }
        }

        return 'Polly.Joanna';
    }

    private static function configAvailable(): bool
    {
        return function_exists('app')
            && app()->bound('config');
    }
}
