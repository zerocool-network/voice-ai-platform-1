<?php

namespace App\Application\Flow\Services;

/**
 * Classifies ConversationRelay WebSocket disconnects from textalk.
 *
 * Benign: TCP probes / idle accept failures (not Twilio).
 * Real session closes after Twilio JSON may map to Twilio error 64105.
 *
 * @see https://www.twilio.com/docs/api/errors/64102
 * @see https://www.twilio.com/docs/api/errors/64105
 * @see https://www.twilio.com/docs/api/errors/64107
 * @see https://www.twilio.com/docs/voice/conversationrelay/websocket-messages
 */
final class ConversationRelayDisconnect
{
    /**
     * Ops checklist when Test Call never logs "← setup":
     * - 64102: wrong wss URL / relay or tunnel down
     * - 64105: our process closed the socket mid-call
     * - 64101 / 64106: invalid TwiML attribute or voice+provider combo
     * - 64107: non-spec WS message or load balancer noise on the socket
     * - 64103 / 64104 / 64109: Twilio internal / max duration / concurrency
     * - Console: accept Voice AI/ML addendum (ConversationRelay onboarding)
     */
    public static function isBenign(string $message): bool
    {
        $normalized = strtolower($message);

        return str_contains($normalized, 'no get in request')
            || str_contains($normalized, 'no key in upgrade request')
            || str_contains($normalized, 'accept failed')
            || str_contains($normalized, 'operation timed out');
    }
}
