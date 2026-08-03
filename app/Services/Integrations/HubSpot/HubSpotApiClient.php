<?php

namespace App\Services\Integrations\HubSpot;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HubSpotApiClient
{
    public function __construct(
        private readonly HubSpotOAuthService $oauth,
        private readonly IntegrationConnectionService $connections,
    ) {}

    public function isConnected(TenantModel $tenant): bool
    {
        return $this->connections->status($tenant, IntegrationProvider::HubSpot) === IntegrationStatus::Connected;
    }

    /** @return list<string> */
    public function grantedScopes(TenantModel $tenant): array
    {
        $config = $this->connections->get($tenant, IntegrationProvider::HubSpot);
        $scopes = $config['scopes'] ?? [];

        return is_array($scopes) ? array_values(array_filter($scopes, 'is_string')) : [];
    }

    public function hasScope(TenantModel $tenant, string $scope): bool
    {
        $granted = $this->grantedScopes($tenant);
        if ($granted === []) {
            return true;
        }

        return in_array($scope, $granted, true);
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function get(TenantModel $tenant, string $path, array $query = []): array
    {
        return $this->request($tenant, 'get', $path, query: $query);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function post(TenantModel $tenant, string $path, array $body = []): array
    {
        return $this->request($tenant, 'post', $path, body: $body);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function patch(TenantModel $tenant, string $path, array $body = []): array
    {
        return $this->request($tenant, 'patch', $path, body: $body);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function put(TenantModel $tenant, string $path, array $body = []): array
    {
        return $this->request($tenant, 'put', $path, body: $body);
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function delete(TenantModel $tenant, string $path): array
    {
        return $this->request($tenant, 'delete', $path);
    }

    /**
     * @param  array<string, mixed>  $query
     * @param  array<string, mixed>  $body
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    private function request(
        TenantModel $tenant,
        string $method,
        string $path,
        array $query = [],
        array $body = [],
    ): array {
        $token = $this->oauth->ensureAccessToken($tenant);
        if ($token === null) {
            return $this->fail(401, 'HubSpot is not connected.', missingScope: false, rateLimited: false);
        }

        $url = rtrim((string) config('hubspot.api_base'), '/').'/'.ltrim($path, '/');

        try {
            /** @var PendingRequest $http */
            $http = Http::withToken($token)->acceptJson()->timeout(30);
            /** @var Response $response */
            $response = match ($method) {
                'get' => $http->get($url, $query),
                'post' => $http->post($url, $body),
                'patch' => $http->patch($url, $body),
                'put' => $http->put($url, $body),
                'delete' => $http->delete($url),
                default => throw new \InvalidArgumentException("Unsupported method [{$method}]"),
            };
        } catch (\Throwable $e) {
            Log::warning('HubSpot API request failed', [
                'tenant_id' => $tenant->id,
                'path' => $path,
                'message' => $e->getMessage(),
            ]);

            return $this->fail(502, 'HubSpot API unavailable.', missingScope: false, rateLimited: false);
        }

        $status = $response->status();
        if ($status === 429) {
            return $this->fail(429, 'HubSpot rate limit reached. Retry shortly.', missingScope: false, rateLimited: true);
        }

        if ($status === 403) {
            $message = (string) ($response->json('message') ?? 'Missing HubSpot scope or plan entitlement.');

            return $this->fail(403, $message, missingScope: true, rateLimited: false);
        }

        if ($status === 401) {
            return $this->fail(401, 'HubSpot authorization expired. Reconnect.', missingScope: false, rateLimited: false);
        }

        if (! $response->successful()) {
            $message = (string) ($response->json('message') ?? 'HubSpot API error.');

            return $this->fail($status, $message, missingScope: false, rateLimited: false);
        }

        return [
            'ok' => true,
            'status' => $status,
            'data' => $response->json() ?? [],
            'error' => null,
            'missing_scope' => false,
            'rate_limited' => false,
        ];
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    private function fail(int $status, string $error, bool $missingScope, bool $rateLimited): array
    {
        return [
            'ok' => false,
            'status' => $status,
            'data' => null,
            'error' => $error,
            'missing_scope' => $missingScope,
            'rate_limited' => $rateLimited,
        ];
    }
}
