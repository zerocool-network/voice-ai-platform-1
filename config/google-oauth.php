<?php

return [
    'client_id' => env('GOOGLE_OAUTH_CLIENT_ID'),
    'client_secret' => env('GOOGLE_OAUTH_CLIENT_SECRET'),
    'redirect_uri' => env('GOOGLE_OAUTH_REDIRECT_URI', env('APP_URL').'/settings/integrations/looker-studio/google/callback'),
    'authorize_url' => 'https://accounts.google.com/o/oauth2/v2/auth',
    'token_url' => 'https://oauth2.googleapis.com/token',
    'scopes' => [
        'https://www.googleapis.com/auth/bigquery',
        'https://www.googleapis.com/auth/cloud-platform.read-only',
    ],
];
