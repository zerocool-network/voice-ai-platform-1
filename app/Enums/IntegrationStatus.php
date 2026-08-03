<?php

namespace App\Enums;

enum IntegrationStatus: string
{
    case Disconnected = 'disconnected';
    case Connected = 'connected';
    case Error = 'error';
}
