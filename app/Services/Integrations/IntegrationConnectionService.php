<?php

namespace App\Services\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class IntegrationConnectionService
{
    private const SECRET_KEYS = [
        'api_key',
        'webhook_secret',
        'access_token',
        'refresh_token',
        'connector_token',
        'token',
    ];

    /** @return array<string, mixed> */
    public function get(TenantModel $tenant, IntegrationProvider $provider): array
    {
        $integrations = $tenant->settings['integrations'] ?? [];

        return is_array($integrations[$provider->value] ?? null)
            ? $integrations[$provider->value]
            : [
                'status' => IntegrationStatus::Disconnected->value,
            ];
    }

    /** @param  array<string, mixed>  $data */
    public function put(TenantModel $tenant, IntegrationProvider $provider, array $data): void
    {
        $settings = $tenant->settings ?? [];
        $integrations = $settings['integrations'] ?? [];
        $existing = is_array($integrations[$provider->value] ?? null) ? $integrations[$provider->value] : [];

        $merged = array_replace_recursive($existing, $data);
        $integrations[$provider->value] = $this->encryptSecrets($merged);
        $settings['integrations'] = $integrations;
        $tenant->settings = $settings;
        $tenant->save();
    }

    public function clear(TenantModel $tenant, IntegrationProvider $provider): void
    {
        $settings = $tenant->settings ?? [];
        $integrations = $settings['integrations'] ?? [];
        unset($integrations[$provider->value]);
        $settings['integrations'] = $integrations;
        $tenant->settings = $settings;
        $tenant->save();
    }

    public function status(TenantModel $tenant, IntegrationProvider $provider): IntegrationStatus
    {
        $config = $this->get($tenant, $provider);
        $raw = $config['status'] ?? IntegrationStatus::Disconnected->value;

        return IntegrationStatus::tryFrom($raw) ?? IntegrationStatus::Disconnected;
    }

    public function decryptSecret(mixed $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return null;
        }
    }

    /** @return array<string, mixed> */
    public function publicView(TenantModel $tenant, IntegrationProvider $provider): array
    {
        $config = $this->get($tenant, $provider);
        $view = $this->stripSecrets($config);
        $view['status'] = $this->status($tenant, $provider)->value;
        $view['is_connected'] = $this->status($tenant, $provider) === IntegrationStatus::Connected;

        return $view;
    }

    public function generateWebhookSecret(): string
    {
        return Str::random(48);
    }

    public function generateConnectorToken(): string
    {
        return 'ls_'.Str::random(48);
    }

    /** @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function encryptSecrets(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->encryptSecrets($value);

                continue;
            }

            if (in_array($key, self::SECRET_KEYS, true) && is_string($value) && $value !== '' && ! $this->looksEncrypted($value)) {
                $data[$key] = Crypt::encryptString($value);
            }
        }

        return $data;
    }

    /** @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function stripSecrets(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->stripSecrets($value);

                continue;
            }

            if (in_array($key, self::SECRET_KEYS, true) || str_ends_with((string) $key, '_hash')) {
                $data[$key.'_set'] = is_string($value) && $value !== '';
                unset($data[$key]);
            }
        }

        return $data;
    }

    private function looksEncrypted(string $value): bool
    {
        try {
            Crypt::decryptString($value);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
