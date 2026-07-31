<?php

namespace App\Application\Flow\Services;

/**
 * Public URLs Twilio can reach (tunnel / production), not local Herd APP_URL.
 */
class TwilioPublicUrl
{
    public static function base(): string
    {
        $configured = config('twilio.webhook_base_url');

        if (is_string($configured) && $configured !== '') {
            return rtrim($configured, '/');
        }

        return rtrim((string) config('app.url'), '/');
    }

    public static function to(string $path): string
    {
        return self::base().'/'.ltrim($path, '/');
    }
}
