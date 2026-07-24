<?php

namespace App\Infrastructure\Services\ElevenLabs;

use Illuminate\Support\Facades\Http;

class ElevenLabsAgentApiService
{
    private const BASE_URL = 'https://api.elevenlabs.io/v1';

    public function __construct(
        private readonly string $apiKey,
    ) {}

    /** @return list<array{agent_id: string, name?: string, conversation_config?: array<string, mixed>, platform_settings?: array<string, mixed>, metadata?: array<string, mixed>, workflow?: array<string, mixed>, tags?: string[]}> */
    public function list(): array
    {
        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->get(self::BASE_URL.'/convai/agents');

        if ($response->failed()) {
            throw new \RuntimeException('Failed to fetch agents: '.$response->body());
        }

        return $response->json()['agents'] ?? [];
    }

    /** @return array<string, mixed> */
    public function get(string $agentId): array
    {
        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->get(self::BASE_URL."/convai/agents/{$agentId}");

        if ($response->failed()) {
            throw new \RuntimeException("Failed to fetch agent {$agentId}: ".$response->body());
        }

        return $response->json();
    }

    /**
     * @param  array{name: string, system_prompt?: string, first_message?: string, language?: string, llm_model?: string, llm_temperature?: float, llm_max_tokens?: int, tts_voice_id?: string, tts_model?: string, turn_sensitivity?: float, stt_provider?: string}  $data
     * @return array{agent_id: string}
     */
    public function create(array $data): array
    {
        $agent = [
            'prompt' => [
                'prompt' => $data['system_prompt'] ?? 'You are a helpful assistant.',
            ],
            'first_message' => $data['first_message'] ?? 'Hello! How can I help you?',
        ];

        if (isset($data['language'])) {
            $agent['language'] = $data['language'];
        }

        if (isset($data['llm_model'])) {
            $agent['llm'] = [
                'model_id' => $data['llm_model'],
                'temperature' => $data['llm_temperature'] ?? 0.7,
                'max_tokens' => $data['llm_max_tokens'] ?? 500,
            ];
        }

        if (isset($data['tts_voice_id']) || isset($data['tts_model'])) {
            $agent['tts'] = [];
            if (isset($data['tts_voice_id'])) {
                $agent['tts']['voice_id'] = $data['tts_voice_id'];
            }
            if (isset($data['tts_model'])) {
                $agent['tts']['model_id'] = $data['tts_model'];
            }
        }

        if (isset($data['turn_sensitivity'])) {
            $agent['conversation_turn_detection'] = [
                'sensitivity' => $data['turn_sensitivity'],
            ];
        }

        if (isset($data['stt_provider'])) {
            $agent['stt'] = [
                'provider' => $data['stt_provider'],
            ];
        }

        $payload = [
            'name' => $data['name'],
            'conversation_config' => [
                'agent' => $agent,
            ],
        ];

        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->post(self::BASE_URL.'/convai/agents/create', $payload);

        if ($response->failed()) {
            throw new \RuntimeException('Failed to create agent: '.$response->body());
        }

        return $response->json();
    }

    /**
     * @param  array{name?: string, system_prompt?: string, first_message?: string, language?: string, llm_model?: string, llm_temperature?: float, llm_max_tokens?: int, tts_voice_id?: string, tts_model?: string, turn_sensitivity?: float, stt_provider?: string}  $data
     * @return array<string, mixed>
     */
    public function update(string $agentId, array $data): array
    {
        $payload = [];

        if (isset($data['name'])) {
            $payload['name'] = $data['name'];
        }

        $agent = [];

        if (isset($data['system_prompt'])) {
            $agent['prompt'] = [
                'prompt' => $data['system_prompt'],
            ];
        }

        if (isset($data['first_message'])) {
            $agent['first_message'] = $data['first_message'];
        }

        if (isset($data['language'])) {
            $agent['language'] = $data['language'];
        }

        if (isset($data['llm_model'])) {
            $llm = ['model_id' => $data['llm_model']];
            if (isset($data['llm_temperature'])) {
                $llm['temperature'] = $data['llm_temperature'];
            }
            if (isset($data['llm_max_tokens'])) {
                $llm['max_tokens'] = $data['llm_max_tokens'];
            }
            $agent['llm'] = $llm;
        }

        if (isset($data['tts_voice_id']) || isset($data['tts_model'])) {
            $tts = [];
            if (isset($data['tts_voice_id'])) {
                $tts['voice_id'] = $data['tts_voice_id'];
            }
            if (isset($data['tts_model'])) {
                $tts['model_id'] = $data['tts_model'];
            }
            $agent['tts'] = $tts;
        }

        if (isset($data['turn_sensitivity'])) {
            $agent['conversation_turn_detection'] = [
                'sensitivity' => $data['turn_sensitivity'],
            ];
        }

        if (isset($data['stt_provider'])) {
            $agent['stt'] = [
                'provider' => $data['stt_provider'],
            ];
        }

        if (! empty($agent)) {
            $payload['conversation_config'] = [
                'agent' => $agent,
            ];
        }

        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->patch(self::BASE_URL."/convai/agents/{$agentId}", $payload);

        if ($response->failed()) {
            throw new \RuntimeException("Failed to update agent {$agentId}: ".$response->body());
        }

        return $response->json();
    }

    public function delete(string $agentId): void
    {
        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])->delete(self::BASE_URL."/convai/agents/{$agentId}");

        if ($response->failed()) {
            throw new \RuntimeException("Failed to delete agent {$agentId}: ".$response->body());
        }
    }
}
