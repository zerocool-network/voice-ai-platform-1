<?php

namespace App\Application\Flow\Services;

/**
 * Builds the ConversationRelay WebSocket URL (must start with wss:// or ws://).
 *
 * Preference order:
 * 1. TWILIO_RELAY_URL
 * 2. Derived from TWILIO_WEBHOOK_BASE_URL (tunnel) — no custom port (TLS on 443)
 * 3. Derived from APP_URL + TWILIO_RELAY_PORT (local only)
 *
 * @see https://www.twilio.com/docs/voice/twiml/connect/conversationrelay
 */
class ConversationRelayUrl
{
    public static function websocket(?string $appUrl = null): string
    {
        $configured = config('twilio.relay_url');

        if (is_string($configured) && $configured !== '') {
            return $configured;
        }

        $webhookBase = config('twilio.webhook_base_url');

        if (is_string($webhookBase) && $webhookBase !== '') {
            return self::fromHttpBase($webhookBase, includeRelayPort: false);
        }

        $base = rtrim($appUrl ?? (string) config('app.url'), '/');

        return self::fromHttpBase($base, includeRelayPort: true);
    }

    private static function fromHttpBase(string $base, bool $includeRelayPort): string
    {
        $path = '/'.ltrim((string) config('twilio.relay_path', '/twilio/relay'), '/');
        $parts = parse_url(rtrim($base, '/'));
        $scheme = ($parts['scheme'] ?? 'https') === 'http' ? 'ws' : 'wss';
        $host = $parts['host'] ?? 'localhost';

        $portSuffix = '';

        if ($includeRelayPort) {
            $port = (int) config('twilio.relay_port', 9091);
            if ($port > 0 && ! in_array($port, [80, 443], true)) {
                $portSuffix = ':'.$port;
            }
        } elseif (isset($parts['port']) && ! in_array((int) $parts['port'], [80, 443], true)) {
            $portSuffix = ':'.$parts['port'];
        }

        return "{$scheme}://{$host}{$portSuffix}{$path}";
    }
}
