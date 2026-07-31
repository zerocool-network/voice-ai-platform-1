<?php

namespace Tests\Unit\Application\Flow;

use App\Application\Flow\Services\FlowSpeechLocale;
use Tests\TestCase;

class FlowSpeechLocaleTest extends TestCase
{
    public function test_maps_short_codes_to_bcp47(): void
    {
        $this->assertSame('en-US', FlowSpeechLocale::bcp47('en'));
        $this->assertSame('es-ES', FlowSpeechLocale::bcp47('es'));
        $this->assertSame('de-DE', FlowSpeechLocale::bcp47('de'));
        $this->assertSame('fr-FR', FlowSpeechLocale::bcp47('fr'));
        $this->assertSame('it-IT', FlowSpeechLocale::bcp47('it'));
        $this->assertSame('pt-BR', FlowSpeechLocale::bcp47('pt'));
    }

    public function test_preserves_known_bcp47(): void
    {
        $this->assertSame('es-MX', FlowSpeechLocale::bcp47('es-MX'));
        $this->assertSame('pt-PT', FlowSpeechLocale::bcp47('pt-PT'));
        $this->assertSame('en-US', FlowSpeechLocale::bcp47('en-US'));
    }

    public function test_unknown_falls_back_to_default(): void
    {
        $this->assertSame('en-US', FlowSpeechLocale::bcp47('xx'));
        $this->assertSame('en-US', FlowSpeechLocale::bcp47(null));
        $this->assertSame('en-US', FlowSpeechLocale::bcp47(''));
    }

    public function test_from_app_locale(): void
    {
        $this->assertSame('es-ES', FlowSpeechLocale::fromAppLocale('es'));
        $this->assertSame('en-US', FlowSpeechLocale::fromAppLocale('en'));
    }

    public function test_voice_matches_language(): void
    {
        $this->assertSame('Polly.Lucia', FlowSpeechLocale::voice('es-ES'));
        $this->assertSame('Polly.Mia', FlowSpeechLocale::voice('es-MX'));
        $this->assertSame('Polly.Joanna', FlowSpeechLocale::voice('en-US'));
        $this->assertSame('Polly.Lucia', FlowSpeechLocale::voice('es'));
    }

    public function test_say_attributes_include_language_and_voice(): void
    {
        $attrs = FlowSpeechLocale::sayAttributes('es-ES');

        $this->assertSame('es-ES', $attrs['language']);
        $this->assertSame('Polly.Lucia', $attrs['voice']);
    }
}
