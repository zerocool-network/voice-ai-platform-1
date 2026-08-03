<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\TranslationLoader\LanguageLine;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_locale_switch_sets_session(): void
    {
        $this->get('/locale/es')
            ->assertRedirect();

        $this->assertEquals('es', session('locale'));
    }

    public function test_locale_switch_accepts_all_supported_locales(): void
    {
        foreach (array_keys(config('locales')) as $locale) {
            $this->get('/locale/'.$locale)->assertRedirect();
            $this->assertEquals($locale, session('locale'));
        }
    }

    public function test_locale_switch_rejects_invalid_locale(): void
    {
        session(['locale' => 'en']);

        $this->get('/locale/xx')
            ->assertRedirect();

        $this->assertEquals('en', session('locale'));
    }

    public function test_available_locales_are_shared_with_inertia(): void
    {
        $tenant = TenantFactory::new()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('availableLocales')
                ->where('availableLocales.en', 'English')
                ->where('availableLocales.es', 'Español')
                ->where('availableLocales.de', 'Deutsch')
                ->where('availableLocales.fr', 'Français')
                ->where('availableLocales.it', 'Italiano')
                ->where('availableLocales.pt', 'Português')
                ->has('translations.ui')
                ->has('translations.navigation')
            );
    }

    public function test_spatie_language_line_overrides_file_translation(): void
    {
        LanguageLine::create([
            'group' => 'dashboard',
            'key' => 'welcome',
            'text' => [
                'en' => 'Welcome to ZeroVoice, :name!',
                'es' => '¡Bienvenido a ZeroVoice, :name!',
            ],
        ]);

        $this->assertSame(
            '¡Bienvenido a ZeroVoice, Ada!',
            trans('dashboard.welcome', ['name' => 'Ada'], 'es'),
        );
    }
}
