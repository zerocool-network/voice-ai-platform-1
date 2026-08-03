<?php

namespace App\Services\Integrations\HubSpot;

use Illuminate\Http\Request;

class HubSpotWebhookSignature
{
    public function isValid(Request $request, string $clientSecret): bool
    {
        if ($clientSecret === '') {
            return false;
        }

        $v3 = $request->header('X-HubSpot-Signature-v3');
        if (is_string($v3) && $v3 !== '') {
            return $this->validateV3($request, $clientSecret, $v3);
        }

        $version = $request->header('X-HubSpot-Signature-Version', 'v1');
        $signature = $request->header('X-HubSpot-Signature');
        if (! is_string($signature) || $signature === '') {
            return false;
        }

        return match ($version) {
            'v2' => $this->validateV2($request, $clientSecret, $signature),
            default => $this->validateV1($request, $clientSecret, $signature),
        };
    }

    private function validateV1(Request $request, string $clientSecret, string $signature): bool
    {
        $expected = hash('sha256', $clientSecret.$request->getContent());

        return hash_equals($expected, $signature);
    }

    private function validateV2(Request $request, string $clientSecret, string $signature): bool
    {
        $uri = $this->publicUri($request);
        $source = $clientSecret.$request->method().$uri.$request->getContent();
        $expected = hash('sha256', $source);

        return hash_equals($expected, $signature);
    }

    private function validateV3(Request $request, string $clientSecret, string $signature): bool
    {
        $timestamp = $request->header('X-HubSpot-Request-Timestamp');
        if (! is_string($timestamp) || ! ctype_digit($timestamp)) {
            return false;
        }

        $ts = (int) $timestamp;
        if (abs(now()->getTimestampMs() - $ts) > 300_000) {
            return false;
        }

        $uri = $this->decodeUriForV3($this->publicUri($request));
        $source = $request->method().$uri.$request->getContent().$timestamp;
        $expected = base64_encode(hash_hmac('sha256', $source, $clientSecret, true));

        return hash_equals($expected, $signature);
    }

    private function publicUri(Request $request): string
    {
        $appUrl = rtrim((string) config('app.url'), '/');
        $path = $request->getRequestUri();

        if ($appUrl !== '') {
            return $appUrl.$path;
        }

        return $request->getUri();
    }

    /**
     * HubSpot v3 selectively decodes specific percent-encodings before signing.
     *
     * @see https://developers.hubspot.com/docs/api/webhooks/validating-requests
     */
    private function decodeUriForV3(string $uri): string
    {
        $map = [
            '%3A' => ':',
            '%2F' => '/',
            '%3F' => '?',
            '%40' => '@',
            '%21' => '!',
            '%24' => '$',
            '%27' => "'",
            '%28' => '(',
            '%29' => ')',
            '%2A' => '*',
            '%2C' => ',',
            '%3B' => ';',
        ];

        return str_ireplace(array_keys($map), array_values($map), $uri);
    }
}
