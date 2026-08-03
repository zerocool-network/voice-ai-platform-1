<?php

namespace Tests\Unit\Integrations;

use App\Services\Integrations\N8n\N8nPublicApiClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class N8nPublicApiClientTest extends TestCase
{
    public function test_test_connection_succeeds_on_workflows_list(): void
    {
        Http::fake([
            'https://example.app.n8n.cloud/api/v1/workflows*' => Http::response([
                'data' => [],
                'nextCursor' => null,
            ], 200),
        ]);

        $client = N8nPublicApiClient::fromConfig('https://example.app.n8n.cloud/api/v1', 'test-key');
        $result = $client->testConnection();

        $this->assertTrue($result['ok']);
        Http::assertSent(fn ($request) => $request->hasHeader('X-N8N-API-KEY', 'test-key'));
    }

    public function test_resource_methods_hit_documented_paths(): void
    {
        Http::fake([
            '*' => Http::response(['ok' => true], 200),
        ]);

        $client = N8nPublicApiClient::fromConfig('https://n8n.example/api/v1', 'key');

        $client->listWorkflows();
        $client->listExecutions();
        $client->listCredentials();
        $client->listUsers();
        $client->listVariables();
        $client->listTags();
        $client->listProjects();
        $client->listFolders('p1');
        $client->generateAudit();
        $client->sourceControlPull();
        $client->listDataTables();
        $client->listTestRuns('w1');
        $client->insightsSummary();
        $client->listCommunityPackages();
        $client->exportN8nPackages();
        $client->listLogStreamingDestinations();
        $client->discover();
        $client->getSsoSamlSettings();
        $client->getOtelSettings();
        $client->getSecurityPolicy();
        $client->listModels();

        Http::assertSentCount(21);
    }
}
