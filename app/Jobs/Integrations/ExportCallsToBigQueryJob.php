<?php

namespace App\Jobs\Integrations;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\Analytics\AnalyticsExportService;
use App\Services\Integrations\IntegrationConnectionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExportCallsToBigQueryJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $tenantId,
    ) {}

    public function handle(
        IntegrationConnectionService $connections,
        AnalyticsExportService $export,
    ): void {
        $tenant = TenantModel::find($this->tenantId);
        if ($tenant === null) {
            return;
        }

        $config = $connections->get($tenant, IntegrationProvider::LookerStudio);
        $bq = is_array($config['bigquery'] ?? null) ? $config['bigquery'] : [];

        if (! ($bq['enabled'] ?? false)) {
            return;
        }

        $projectId = $bq['project_id'] ?? null;
        $dataset = $bq['dataset'] ?? null;
        $oauth = $bq['google_oauth'] ?? null;

        if (! is_string($projectId) || ! is_string($dataset) || ! is_array($oauth)) {
            Log::warning('BigQuery export skipped: incomplete config', ['tenant_id' => $tenant->id]);

            return;
        }

        $accessToken = $connections->decryptSecret($oauth['access_token'] ?? null);
        if ($accessToken === null) {
            return;
        }

        $payload = $export->export($tenant, null, 500);
        $table = "{$projectId}.{$dataset}.voice_ai_calls";

        $response = Http::withToken($accessToken)
            ->post("https://bigquery.googleapis.com/bigquery/v2/projects/{$projectId}/datasets/{$dataset}/tables/voice_ai_calls/insertAll", [
                'rows' => collect($payload['rows'])->map(fn (array $row) => [
                    'json' => $row,
                ])->all(),
            ]);

        if (! $response->successful()) {
            Log::warning('BigQuery insertAll failed', [
                'tenant_id' => $tenant->id,
                'status' => $response->status(),
                'table' => $table,
            ]);

            $connections->put($tenant, IntegrationProvider::LookerStudio, [
                'status' => IntegrationStatus::Error->value,
                'last_error' => 'BigQuery export failed',
            ]);
        }
    }
}
