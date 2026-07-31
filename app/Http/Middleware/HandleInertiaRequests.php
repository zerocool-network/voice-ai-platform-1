<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $locale = session('locale', 'en');
        App::setLocale($locale);
        $translations = $this->loadTranslations($locale);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
                'token' => $request->session()->get('token'),
                'success' => $request->session()->get('success'),
            ],
            'locale' => $locale,
            'availableLocales' => config('locales'),
            'translations' => $translations,
            'isImpersonating' => session()->has('impersonator_id'),
            'impersonatedUser' => session()->has('impersonator_id') ? $request->user()?->name : null,
        ];
    }

    /** @return array<string, array<string, mixed>> */
    private function loadTranslations(string $locale): array
    {
        $namespaces = ['common', 'navigation', 'dashboard', 'flows', 'calls', 'settings', 'team', 'api-tokens', 'auth', 'ui'];

        $translations = [];
        foreach ($namespaces as $ns) {
            $lines = trans($ns, [], $locale);
            if (is_array($lines)) {
                $translations[$ns] = $lines;
            }
        }

        return $translations;
    }
}
