<?php

namespace App\Application\Flow\Services;

/**
 * Public URLs Twilio can reach (tunnel / production), not local Herd APP_URL.
 */
class TwilioPublicUrl
{
    public static function base(): string
    {
        if (! self::configAvailable()) {
            return '';
        }

        $configured = config('twilio.webhook_base_url');

        if (is_string($configured) && $configured !== '') {
            return rtrim($configured, '/');
        }

        return rtrim((string) config('app.url'), '/');
    }

    public static function to(string $path): string
    {
        $base = self::base();
        $normalized = '/'.ltrim($path, '/');

        return $base === '' ? $normalized : $base.$normalized;
    }

    private static function configAvailable(): bool
    {
        return function_exists('app')
            && app()->bound('config');
    }
}
