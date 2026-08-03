<?php

return [
    'client_id' => env('HUBSPOT_CLIENT_ID'),
    'client_secret' => env('HUBSPOT_CLIENT_SECRET'),
    'redirect_uri' => env('HUBSPOT_REDIRECT_URI', env('APP_URL').'/settings/integrations/hubspot/callback'),
    'authorize_url' => 'https://app.hubspot.com/oauth/authorize',
    'token_url' => 'https://api.hubapi.com/oauth/v1/token',
    'scopes' => [
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.objects.companies.read',
        'crm.objects.companies.write',
        'crm.objects.deals.read',
        'crm.objects.deals.write',
        'crm.objects.tickets.read',
        'crm.objects.tickets.write',
        'crm.objects.owners.read',
        'crm.schemas.contacts.read',
        'crm.schemas.companies.read',
        'crm.schemas.deals.read',
        'crm.schemas.tickets.read',
        'timeline',
        'oauth',
    ],
];
