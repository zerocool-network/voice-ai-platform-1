<?php

namespace App\Http\Middleware;

use App\Application\Flow\Services\TwilioPublicUrl;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Twilio\Security\RequestValidator;

class ValidateTwilioRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->header('X-Twilio-Signature');

        if (! $signature) {
            abort(403, 'Missing Twilio signature');
        }

        $validator = new RequestValidator(config('twilio.auth_token'));

        // Twilio signs the public webhook URL. Behind Cloudflare/Herd the Host
        // header is rewritten (e.g. voice-ai-platform.test), so fullUrl() does
        // not match what Twilio signed — use TWILIO_WEBHOOK_BASE_URL instead.
        $url = TwilioPublicUrl::base().$request->getRequestUri();

        // POST body only — query string is already part of the signed URL.
        // $request->all() would re-include ?flow_id=… and break validation.
        if (! $validator->validate($signature, $url, $request->post())) {
            abort(403, 'Invalid Twilio signature');
        }

        return $next($request);
    }
}
