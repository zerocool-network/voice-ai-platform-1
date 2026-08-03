<?php

namespace App\Enums;

enum IntegrationProvider: string
{
    case N8n = 'n8n';
    case HubSpot = 'hubspot';
    case LookerStudio = 'looker_studio';
}
