<?php

namespace App\Services\Integrations\HubSpot;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use HubSpot\Delay;
use HubSpot\Factory;
use HubSpot\RetryMiddlewareFactory;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HubSpotOAuthService
{
    public function __construct(
        private readonly IntegrationConnectionService $connections,
    ) {}

    public function authorizationUrl(TenantModel $tenant, int $userId): string
    {
        $state = Crypt::encryptString(json_encode([
            'tenant_id' => $tenant->id,
            'user_id' => $userId,
            'created_at' => now()->timestamp,
        ]));

        $query = http_build_query([
            'client_id' => config('hubspot.client_id'),
            'redirect_uri' => config('hubspot.redirect_uri'),
            'scope' => implode(' ', config('hubspot.scopes', [])),
            'state' => $state,
        ]);

        return config('hubspot.authorize_url').'?'.$query;
    }

    /** @return array{ok: bool, error: ?string} */
    public function handleCallback(TenantModel $tenant, string $code): array
    {
        $tokenResponse = Http::asForm()->post(config('hubspot.token_url'), [
            'grant_type' => 'authorization_code',
            'client_id' => config('hubspot.client_id'),
            'client_secret' => config('hubspot.client_secret'),
            'redirect_uri' => config('hubspot.redirect_uri'),
            'code' => $code,
        ]);

        if (! $tokenResponse->successful()) {
            Log::warning('HubSpot OAuth token exchange failed', [
                'status' => $tokenResponse->status(),
            ]);

            return ['ok' => false, 'error' => 'HubSpot authorization failed. Please try again.'];
        }

        $tokenData = $tokenResponse->json();
        $accessToken = $tokenData['access_token'] ?? null;
        $refreshToken = $tokenData['refresh_token'] ?? null;

        if (! is_string($accessToken) || $accessToken === '') {
            return ['ok' => false, 'error' => 'HubSpot did not return an access token.'];
        }

        $portalId = null;
        $accountInfo = Http::withToken($accessToken)
            ->acceptJson()
            ->get('https://api.hubapi.com/account-info/v3/details');
        if ($accountInfo->successful()) {
            $portalId = (string) ($accountInfo->json('portalId') ?? $accountInfo->json('hub_id') ?? '');
        }

        $this->connections->put($tenant, IntegrationProvider::HubSpot, [
            'oauth' => [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at' => now()->addSeconds((int) ($tokenData['expires_in'] ?? 21600))->timestamp,
            ],
            'portal_id' => $portalId,
            'scopes' => explode(' ', (string) ($tokenData['scope'] ?? '')),
            'auth_source' => 'oauth',
            'status' => IntegrationStatus::Connected->value,
            'connected_at' => now()->toIso8601String(),
            'last_error' => null,
            'sync' => [
                'create_contact' => true,
                'log_call_engagement' => true,
                'create_ticket_on_transfer' => false,
                'property_map' => [],
            ],
        ]);

        return ['ok' => true, 'error' => null];
    }

    public function disconnect(TenantModel $tenant): void
    {
        $this->connections->clear($tenant, IntegrationProvider::HubSpot);
    }

    public function clientFor(TenantModel $tenant): mixed
    {
        $accessToken = $this->ensureAccessToken($tenant);
        if ($accessToken === null) {
            throw new \RuntimeException('HubSpot is not connected for this tenant.');
        }

        $handlerStack = HandlerStack::create();
        $handlerStack->push(RetryMiddlewareFactory::createRateLimitMiddleware(
            Delay::getConstantDelayFunction()
        ));
        $handlerStack->push(RetryMiddlewareFactory::createInternalErrorsMiddleware());
        $handlerStack->push(RetryMiddlewareFactory::createConnectionErrorsMiddleware());

        $guzzle = new Client(['handler' => $handlerStack]);

        return Factory::createWithAccessToken($accessToken, $guzzle);
    }

    public function ensureAccessToken(TenantModel $tenant): ?string
    {
        $config = $this->connections->get($tenant, IntegrationProvider::HubSpot);
        $oauth = $config['oauth'] ?? null;
        if (! is_array($oauth)) {
            return null;
        }

        $accessToken = $this->connections->decryptSecret($oauth['access_token'] ?? null);
        $refreshToken = $this->connections->decryptSecret($oauth['refresh_token'] ?? null);
        $expiresAt = (int) ($oauth['expires_at'] ?? 0);

        if ($accessToken === null) {
            return null;
        }

        if ($expiresAt > now()->addMinutes(2)->timestamp) {
            return $accessToken;
        }

        if ($refreshToken === null) {
            return $accessToken;
        }

        $tokenResponse = Http::asForm()->post(config('hubspot.token_url'), [
            'grant_type' => 'refresh_token',
            'client_id' => config('hubspot.client_id'),
            'client_secret' => config('hubspot.client_secret'),
            'refresh_token' => $refreshToken,
        ]);

        if (! $tokenResponse->successful()) {
            $this->connections->put($tenant, IntegrationProvider::HubSpot, [
                'status' => IntegrationStatus::Error->value,
                'last_error' => 'Token refresh failed',
            ]);

            return null;
        }

        $tokenData = $tokenResponse->json();
        $this->connections->put($tenant, IntegrationProvider::HubSpot, [
            'oauth' => [
                'access_token' => $tokenData['access_token'],
                'refresh_token' => $tokenData['refresh_token'] ?? $refreshToken,
                'expires_at' => now()->addSeconds((int) ($tokenData['expires_in'] ?? 21600))->timestamp,
            ],
            'status' => IntegrationStatus::Connected->value,
            'last_error' => null,
        ]);

        return $tokenData['access_token'];
    }
}
