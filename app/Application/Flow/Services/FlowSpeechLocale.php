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

    /**
     * Map Twilio BCP-47 (or short code) to Laravel app locale (en, es, …).
     */
    public static function appLocale(?string $stored): string
    {
        $bcp47 = self::bcp47($stored);
        $primary = strtolower(explode('-', $bcp47)[0] ?? 'en');

        return $primary !== '' ? $primary : 'en';
    }

    /**
     * @param  array<string, mixed>  $replace
     */
    public static function speak(?string $stored, string $key, array $replace = []): string
    {
        if (! function_exists('app') || ! app()->bound('translator')) {
            return self::fallbackSpeak($key, $replace);
        }

        return (string) __($key, $replace, self::appLocale($stored));
    }

    /**
     * @param  array<string, mixed>  $replace
     */
    private static function fallbackSpeak(string $key, array $replace = []): string
    {
        $lines = [
            'speech.consent_default' => 'This call may be recorded.',
            'speech.consent_prompt' => 'Press 1 to accept, or any other key to decline.',
            'speech.consent_timeout' => 'You did not provide consent. Goodbye.',
            'speech.goodbye' => 'Goodbye.',
            'speech.not_configured' => 'Sorry, this number is not configured. Goodbye.',
            'speech.welcome_greeting' => 'Hello! How can I help you today?',
            'speech.ai_trouble' => 'I am sorry, I am having trouble right now.',
            'speech.llm_trouble' => 'I am sorry, I am having trouble processing your request right now.',
            'speech.mcp_not_configured' => 'MCP tool is not configured.',
            'speech.mcp_unavailable' => 'MCP tooling is unavailable.',
            'speech.mcp_failed' => 'MCP tool call failed.',
            'speech.mcp_success' => 'MCP tool completed successfully.',
            'speech.webhook_not_configured' => 'Webhook URL not configured.',
            'speech.webhook_failed' => 'Webhook returned status :status',
            'speech.n8n_not_configured' => 'n8n is not configured.',
            'speech.n8n_triggered' => 'n8n workflow triggered.',
            'speech.n8n_failed' => 'n8n workflow action failed.',
            'speech.hubspot_not_configured' => 'HubSpot is not configured.',
            'speech.hubspot_synced' => 'HubSpot sync completed.',
            'speech.hubspot_failed' => 'HubSpot sync failed.',
            'speech.memory_unavailable' => 'Unable to load your profile.',
        ];

        $text = $lines[$key] ?? $key;

        foreach ($replace as $name => $value) {
            $text = str_replace(':'.$name, (string) $value, $text);
        }

        return $text;
    }

    /** @return array<string, string> */
    public static function elevenLabsVoices(): array
    {
        if (self::configAvailable()) {
            $configured = config('flow.elevenlabs_voices');

            if (is_array($configured) && $configured !== []) {
                /** @var array<string, string> $configured */
                return $configured;
            }
        }

        return [];
    }

    public static function elevenLabsVoice(?string $stored): ?string
    {
        $locale = self::bcp47($stored);
        $voices = self::elevenLabsVoices();

        if (isset($voices[$locale])) {
            return $voices[$locale];
        }

        // Twilio has no es-MX CR default; use documented es-US voice ID.
        if ($locale === 'es-MX' && isset($voices['es-US'])) {
            return $voices['es-US'];
        }

        return null;
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
