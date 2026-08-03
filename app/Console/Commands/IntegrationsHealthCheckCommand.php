<?php

namespace App\Console\Commands;

use App\Jobs\Integrations\CheckIntegrationHealthJob;
use Illuminate\Console\Command;

class IntegrationsHealthCheckCommand extends Command
{
    protected $signature = 'integrations:health-check';

    protected $description = 'Run health checks for n8n and HubSpot tenant integrations';

    public function handle(): int
    {
        CheckIntegrationHealthJob::dispatchSync();
        $this->info('Integration health checks completed.');

        return self::SUCCESS;
    }
}
