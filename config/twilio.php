<?php

return [
    'account_sid' => env('TWILIO_ACCOUNT_SID'),
    'auth_token' => env('TWILIO_AUTH_TOKEN'),
    'sip_domain' => env('TWILIO_SIP_DOMAIN'),
    'media_worker_url' => env('MEDIA_STREAM_WORKER_URL', 'ws://localhost:9090'),
    'ai_assistant_sid' => env('TWILIO_AI_ASSISTANT_SID'),

    /*
    | Public HTTPS base Twilio hits (tunnel or production), e.g. https://voiceai.example.com
    | Used for Test Call redirects/status callbacks — not local APP_URL.
    */
    'webhook_base_url' => env('TWILIO_WEBHOOK_BASE_URL'),

    /*
    | ConversationRelay WebSocket (must be wss:// for Twilio).
    | Prefer TWILIO_RELAY_URL; else derived from TWILIO_WEBHOOK_BASE_URL.
    */
    'relay_url' => env('TWILIO_RELAY_URL'),
    'relay_path' => env('TWILIO_RELAY_PATH', '/twilio/relay'),
    'relay_port' => (int) env('TWILIO_RELAY_PORT', 9091),
];
