<?php

namespace App\Http\Controllers\Web;

use App\Domain\Voice\Repositories\CustomVoiceRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Infrastructure\Persistence\Eloquent\Voice\CustomVoiceModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class VoiceController extends Controller
{
    public function __construct(
        private readonly CustomVoiceRepositoryInterface $voiceRepository,
    ) {}

    public function index(Request $request): Response
    {
        $voices = CustomVoiceModel::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Settings/Voices/Index', [
            'voices' => $voices,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'files' => ['required', 'array', 'min:1', 'max:3'],
            'files.*' => ['file', 'mimes:mp3,wav,flac,m4a', 'max:25000'],
            'description' => ['nullable', 'string', 'max:500'],
            'remove_background_noise' => ['boolean'],
        ]);

        $tenant = TenantModel::find($request->user()->tenant_id);
        $apiKey = $tenant->elevenlabs_api_key;

        if (! $apiKey) {
            return redirect()->route('settings.voices.index')
                ->with('success', 'Configure your ElevenLabs API key in Tenant Settings.');
        }

        $http = Http::withHeaders(['xi-api-key' => $apiKey])
            ->timeout(60)
            ->attach('name', $validated['name']);

        if (isset($validated['description'])) {
            $http->attach('description', $validated['description']);
        }

        if ($request->boolean('remove_background_noise')) {
            $http->attach('remove_background_noise', 'true');
        }

        foreach ($request->file('files') as $file) {
            $http->attach(
                'files',
                $file->getContent(),
                $file->getClientOriginalName(),
            );
        }

        try {
            $response = $http->post('https://api.elevenlabs.io/v1/voices/add');

            if ($response->failed()) {
                $error = $response->json()['detail']['message'] ?? $response->body();

                return redirect()->route('settings.voices.index')
                    ->with('error', 'Failed to clone voice: '.$error);
            }

            $voiceId = $response->json()['voice_id'];
        } catch (\Exception $e) {
            return redirect()->route('settings.voices.index')
                ->with('error', 'Failed to connect to ElevenLabs: '.$e->getMessage());
        }

        $existingCount = CustomVoiceModel::where('tenant_id', $request->user()->tenant_id)->count();

        CustomVoiceModel::create([
            'tenant_id' => $request->user()->tenant_id,
            'elevenlabs_voice_id' => $voiceId,
            'name' => $validated['name'],
            'sample_count' => $response->json()['sample_count'] ?? count($request->file('files')),
            'description' => $validated['description'] ?? null,
            'labels' => $response->json()['labels'] ?? null,
            'is_default' => $existingCount === 0,
            'requires_verification' => $response->json()['requires_verification'] ?? false,
            'preview_url' => $response->json()['preview_url'] ?? null,
        ]);

        activity()
            ->event('voice_cloned')
            ->performedOn($tenant)
            ->withProperties([
                'voice_id' => $voiceId,
                'name' => $validated['name'],
            ])
            ->log("Voice '{$validated['name']}' cloned from ElevenLabs");

        return redirect()->route('settings.voices.index')
            ->with('success', 'Voice cloned successfully.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $voice = $this->voiceRepository->findById($id);

        if ($voice === null || $voice->tenantId() !== $request->user()->tenant_id) {
            abort(403);
        }

        $voiceName = $voice->name();
        $elevenlabsVoiceId = $voice->elevenlabsVoiceId();

        $tenant = TenantModel::find($request->user()->tenant_id);
        $apiKey = $tenant->elevenlabs_api_key;

        if ($apiKey !== null) {
            try {
                Http::withHeaders(['xi-api-key' => Crypt::decryptString($apiKey)])
                    ->timeout(10)
                    ->delete("https://api.elevenlabs.io/v1/voices/{$elevenlabsVoiceId}");
            } catch (\Exception $e) {
                // Log but don't block deletion
                activity()
                    ->event('voice_delete_elevenlabs_failed')
                    ->log("Failed to delete voice '{$voiceName}' from ElevenLabs: {$e->getMessage()}");
            }
        }

        $this->voiceRepository->delete($id);

        activity()
            ->event('voice_deleted')
            ->withProperties([
                'voice_id' => $id,
                'name' => $voiceName,
            ])
            ->log("Voice '{$voiceName}' deleted");

        return redirect()->route('settings.voices.index')
            ->with('success', 'Voice deleted.');
    }

    public function setDefault(Request $request, string $id): RedirectResponse
    {
        $voice = $this->voiceRepository->findById($id);

        if ($voice === null || $voice->tenantId() !== $request->user()->tenant_id) {
            abort(403);
        }

        CustomVoiceModel::where('tenant_id', $request->user()->tenant_id)
            ->update(['is_default' => false]);

        CustomVoiceModel::where('id', $id)->update(['is_default' => true]);

        activity()
            ->event('voice_set_default')
            ->withProperties(['voice_id' => $id, 'name' => $voice->name()])
            ->log("Voice '{$voice->name()}' set as default");

        return redirect()->route('settings.voices.index')
            ->with('success', "Voice '{$voice->name()}' set as default.");
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $voice = $this->voiceRepository->findById($id);

        if ($voice === null || $voice->tenantId() !== $request->user()->tenant_id) {
            abort(404);
        }

        return response()->json([
            'id' => $voice->id(),
            'elevenlabs_voice_id' => $voice->elevenlabsVoiceId(),
            'name' => $voice->name(),
            'preview_url' => $voice->previewUrl(),
            'sample_count' => $voice->sampleCount(),
            'description' => $voice->description(),
            'labels' => $voice->labels(),
            'is_default' => $voice->isDefault(),
            'requires_verification' => $voice->requiresVerification(),
        ]);
    }

    public function library(Request $request): JsonResponse
    {
        $tenant = TenantModel::find($request->user()->tenant_id);
        $apiKey = $tenant->elevenlabs_api_key;

        if (! $apiKey) {
            return response()->json(['error' => 'ElevenLabs API key not configured.'], 502);
        }

        $query = [
            'page_size' => 20,
        ];

        if ($request->has('search')) {
            $query['search'] = $request->input('search');
        }

        if ($request->has('cursor')) {
            $query['cursor'] = $request->input('cursor');
        }

        try {
            $response = Http::withHeaders(['xi-api-key' => $apiKey])
                ->timeout(30)
                ->get('https://api.elevenlabs.io/v1/voices', $query);

            if ($response->failed()) {
                return response()->json(['error' => 'Failed to fetch voices from ElevenLabs.'], 502);
            }

            $data = $response->json();

            return response()->json([
                'data' => $data['voices'] ?? [],
                'next_cursor' => $data['next_cursor'] ?? null,
                'has_more' => $data['has_more'] ?? false,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to connect to ElevenLabs.'], 502);
        }
    }

    public function addFromLibrary(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'elevenlabs_voice_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'preview_url' => ['nullable', 'url'],
            'description' => ['nullable', 'string', 'max:500'],
            'labels' => ['nullable', 'array'],
        ]);

        $tenantId = $request->user()->tenant_id;

        $existing = CustomVoiceModel::where('tenant_id', $tenantId)
            ->where('elevenlabs_voice_id', $validated['elevenlabs_voice_id'])
            ->exists();

        if ($existing) {
            return redirect()->route('settings.voices.index')
                ->with('error', 'This voice is already in your collection.');
        }

        $existingCount = CustomVoiceModel::where('tenant_id', $tenantId)->count();

        $tenant = TenantModel::find($tenantId);

        CustomVoiceModel::create([
            'tenant_id' => $tenantId,
            'elevenlabs_voice_id' => $validated['elevenlabs_voice_id'],
            'name' => $validated['name'],
            'sample_count' => 0,
            'description' => $validated['description'] ?? null,
            'labels' => $validated['labels'] ?? null,
            'is_default' => $existingCount === 0,
            'requires_verification' => false,
            'preview_url' => $validated['preview_url'] ?? null,
        ]);

        activity()
            ->event('voice_added_from_library')
            ->performedOn($tenant)
            ->withProperties([
                'voice_id' => $validated['elevenlabs_voice_id'],
                'name' => $validated['name'],
            ])
            ->log("Voice '{$validated['name']}' added from library");

        return redirect()->route('settings.voices.index')
            ->with('success', "Voice '{$validated['name']}' added to your collection.");
    }
}
