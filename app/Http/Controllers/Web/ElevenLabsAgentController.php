<?php

namespace App\Http\Controllers\Web;

use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\ElevenLabs\ElevenLabsAgentModel;
use App\Infrastructure\Services\ElevenLabs\ElevenLabsAgentApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ElevenLabsAgentController extends Controller
{
    public function __construct(
        private readonly TenantRepositoryInterface $tenantRepository,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('manageAgents');
        $localAgents = ElevenLabsAgentModel::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Settings/Agents/Index', [
            'agents' => $localAgents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('manageAgents');
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'system_prompt' => ['nullable', 'string', 'max:10000'],
            'first_message' => ['nullable', 'string', 'max:500'],
            'language' => ['nullable', 'string', 'max:10'],
            'llm_model' => ['nullable', 'string', 'max:255'],
            'llm_temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'llm_max_tokens' => ['nullable', 'integer', 'min:100', 'max:4096'],
            'tts_voice_id' => ['nullable', 'string', 'max:255'],
            'tts_model' => ['nullable', 'string', 'max:255'],
            'turn_sensitivity' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'stt_provider' => ['nullable', 'string', 'max:255'],
        ]);

        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);
        abort_if($tenant === null, 404);

        $apiKey = $tenant->settings()['elevenlabs_api_key'] ?? null;
        if (! $apiKey) {
            return redirect()->route('settings.agents.index')
                ->with('success', 'Configure your ElevenLabs API key in Tenant Settings first.');
        }

        $api = new ElevenLabsAgentApiService($apiKey);

        try {
            $result = $api->create($validated);
        } catch (\RuntimeException $e) {
            return redirect()->route('settings.agents.index')
                ->with('error', 'Failed to create agent: '.$e->getMessage());
        }

        ElevenLabsAgentModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'elevenlabs_agent_id' => $result['agent_id'],
            'config' => $validated,
        ]);

        return redirect()->route('settings.agents.index')
            ->with('success', 'Agent created.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        Gate::authorize('manageAgents');
        $agent = ElevenLabsAgentModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'system_prompt' => ['nullable', 'string', 'max:10000'],
            'first_message' => ['nullable', 'string', 'max:500'],
            'language' => ['nullable', 'string', 'max:10'],
            'llm_model' => ['nullable', 'string', 'max:255'],
            'llm_temperature' => ['nullable', 'numeric', 'min:0', 'max:2'],
            'llm_max_tokens' => ['nullable', 'integer', 'min:100', 'max:4096'],
            'tts_voice_id' => ['nullable', 'string', 'max:255'],
            'tts_model' => ['nullable', 'string', 'max:255'],
            'turn_sensitivity' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'stt_provider' => ['nullable', 'string', 'max:255'],
        ]);

        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);
        abort_if($tenant === null, 404);

        $apiKey = $tenant->settings()['elevenlabs_api_key'] ?? null;
        if (! $apiKey) {
            return redirect()->route('settings.agents.index')
                ->with('success', 'Configure your ElevenLabs API key in Tenant Settings.');
        }

        $api = new ElevenLabsAgentApiService($apiKey);

        try {
            $api->update($agent->elevenlabs_agent_id, $validated);
        } catch (\RuntimeException $e) {
            return redirect()->route('settings.agents.index')
                ->with('error', 'Failed to update agent: '.$e->getMessage());
        }

        $agent->update([
            'name' => $validated['name'],
            'config' => $validated,
        ]);

        return redirect()->route('settings.agents.index')
            ->with('success', 'Agent updated.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        Gate::authorize('manageAgents');
        $agent = ElevenLabsAgentModel::where('tenant_id', $request->user()->tenant_id)
            ->where('id', $id)
            ->firstOrFail();

        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);
        abort_if($tenant === null, 404);

        $apiKey = $tenant->settings()['elevenlabs_api_key'] ?? null;
        if ($apiKey) {
            $api = new ElevenLabsAgentApiService($apiKey);

            try {
                $api->delete($agent->elevenlabs_agent_id);
            } catch (\RuntimeException) {
                // Agent may already be deleted in ElevenLabs — remove locally regardless
            }
        }

        $agent->delete();

        return redirect()->route('settings.agents.index')
            ->with('success', 'Agent removed.');
    }

    public function syncFromApi(Request $request): RedirectResponse
    {
        Gate::authorize('manageAgents');
        $tenant = $this->tenantRepository->findById($request->user()->tenant_id);
        abort_if($tenant === null, 404);

        $apiKey = $tenant->settings()['elevenlabs_api_key'] ?? null;
        if (! $apiKey) {
            return redirect()->route('settings.agents.index')
                ->with('success', 'Configure your ElevenLabs API key in Tenant Settings first.');
        }

        $api = new ElevenLabsAgentApiService($apiKey);

        try {
            $remoteAgents = $api->list();
        } catch (\RuntimeException $e) {
            return redirect()->route('settings.agents.index')
                ->with('error', 'Failed to sync agents: '.$e->getMessage());
        }

        $existingIds = ElevenLabsAgentModel::where('tenant_id', $request->user()->tenant_id)
            ->pluck('elevenlabs_agent_id');

        foreach ($remoteAgents as $remote) {
            if (! $existingIds->contains($remote['agent_id'])) {
                ElevenLabsAgentModel::create([
                    'tenant_id' => $request->user()->tenant_id,
                    'name' => $remote['name'] ?? 'Unnamed Agent',
                    'elevenlabs_agent_id' => $remote['agent_id'],
                    'config' => [
                        'name' => $remote['name'] ?? 'Unnamed Agent',
                    ],
                ]);
            }
        }

        return redirect()->route('settings.agents.index')
            ->with('success', 'Agents synced from ElevenLabs.');
    }
}
