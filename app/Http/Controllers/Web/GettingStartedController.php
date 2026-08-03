<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GettingStartedController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        $tenant = $user->tenant_id ? TenantModel::find($user->tenant_id) : null;

        if ($tenant === null) {
            $tenant = TenantModel::create([
                'name' => $user->name,
                'slug' => Str::slug($user->name).'-'.Str::random(6),
                'settings' => [],
                'plan' => 'free',
            ]);

            $user->update(['tenant_id' => $tenant->id]);
        }

        $settings = $tenant->settings ?? [];

        if ($settings['onboarding_completed'] ?? false) {
            return redirect()->route('dashboard');
        }

        $hasPhone = FlowModel::where('tenant_id', $user->tenant_id)->whereNotNull('phone_number')->exists();
        $hasFlow = FlowModel::where('tenant_id', $user->tenant_id)->exists();

        return Inertia::render('GettingStarted/Index', [
            'twilioConnected' => ! empty($settings['twilio_oauth'] ?? null) || ! empty($settings['twilio_account_sid'] ?? null),
            'elevenlabsConnected' => ! empty($settings['elevenlabs_api_key'] ?? null),
            'hasPhone' => $hasPhone,
            'hasFlow' => $hasFlow,
            'n8nConnected' => ($settings['integrations']['n8n']['status'] ?? null) === 'connected',
            'hubspotConnected' => ($settings['integrations']['hubspot']['status'] ?? null) === 'connected',
            'lookerConnected' => ($settings['integrations']['looker_studio']['status'] ?? null) === 'connected',
        ]);
    }

    public function complete(Request $request): RedirectResponse
    {
        $user = $request->user();
        $tenant = TenantModel::find($user->tenant_id);

        if ($tenant !== null) {
            $settings = $tenant->settings ?? [];
            $settings['onboarding_completed'] = true;
            $tenant->update(['settings' => $settings]);
        }

        activity('onboarding')
            ->causedBy($user)
            ->event('onboarding_completed')
            ->log(':causer.name completó el asistente de configuración');

        return redirect()->route('dashboard')
            ->with('message', 'You are all set! Start building your voice flows.');
    }
}
