<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Psr\Log\LoggerInterface;

class ConversationMemoryService
{
    public function __construct(
        private readonly ?LoggerInterface $logger = null,
    ) {}

    public function searchProfile(string $phoneNumber, ?string $storeId = null, ?string $accountSid = null, ?string $authToken = null): ?array
    {
        $storeId ??= config('twilio.conversation_memory_store_id');

        if (! $storeId || ! $accountSid || ! $authToken) {
            $this->logger?->warning('Conversation Memory not configured');

            return null;
        }

        $response = Http::withBasicAuth($accountSid, $authToken)
            ->post("https://memory.twilio.com/v1/Stores/{$storeId}/Profiles:search", [
                'identifiers' => [
                    ['type' => 'phone_number', 'value' => $phoneNumber],
                ],
            ]);

        if (! $response->successful()) {
            $this->logger?->warning('Memory search failed', ['status' => $response->status()]);

            return null;
        }

        $profiles = $response->json('profiles') ?? [];

        return $profiles[0] ?? null;
    }

    public function recallProfile(string $profileId, ?string $storeId = null, ?string $accountSid = null, ?string $authToken = null): ?array
    {
        $storeId ??= config('twilio.conversation_memory_store_id');

        if (! $storeId || ! $accountSid || ! $authToken) {
            return null;
        }

        $response = Http::withBasicAuth($accountSid, $authToken)
            ->post("https://memory.twilio.com/v1/Stores/{$storeId}/Profiles/{$profileId}/Recall", [
                'limit' => 10,
            ]);

        if (! $response->successful()) {
            $this->logger?->warning('Memory recall failed', ['status' => $response->status()]);

            return null;
        }

        return $response->json();
    }
}
