<?php

namespace App\Infrastructure\Persistence\Eloquent\HubSpot;

use Illuminate\Database\Eloquent\Model;

class HubSpotWebhookEventModel extends Model
{
    protected $table = 'hubspot_webhook_events';

    protected $fillable = [
        'tenant_id',
        'portal_id',
        'subscription_type',
        'object_id',
        'payload',
        'processed_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
