<?php

namespace App\Services\Integrations\N8n;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * First-party client for the n8n Public REST API (OpenAPI 1.1.x).
 *
 * @see https://docs.n8n.io/connect/n8n-api/
 */
class N8nPublicApiClient
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly string $apiKey,
        private readonly int $timeout = 30,
    ) {}

    public static function fromConfig(string $baseUrl, string $apiKey, ?int $timeout = null): self
    {
        return new self(
            rtrim($baseUrl, '/'),
            $apiKey,
            $timeout ?? (int) config('integrations.default_timeout', 30),
        );
    }

    /** @return array{ok: bool, status: int, body: mixed, error: ?string} */
    public function testConnection(): array
    {
        try {
            $response = $this->get('/workflows', ['limit' => 1]);

            return [
                'ok' => $response->successful(),
                'status' => $response->status(),
                'body' => $response->json(),
                'error' => $response->successful() ? null : $response->body(),
            ];
        } catch (\Throwable $e) {
            return [
                'ok' => false,
                'status' => 0,
                'body' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ── Workflows ──────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listWorkflows(array $query = []): Response
    {
        return $this->get('/workflows', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createWorkflow(array $payload): Response
    {
        return $this->post('/workflows', $payload);
    }

    public function getWorkflow(string $id, bool $excludePinnedData = false): Response
    {
        return $this->get("/workflows/{$id}", array_filter([
            'excludePinnedData' => $excludePinnedData ?: null,
        ]));
    }

    /** @param  array<string, mixed>  $payload */
    public function updateWorkflow(string $id, array $payload): Response
    {
        return $this->put("/workflows/{$id}", $payload);
    }

    public function deleteWorkflow(string $id): Response
    {
        return $this->delete("/workflows/{$id}");
    }

    public function activateWorkflow(string $id): Response
    {
        return $this->post("/workflows/{$id}/activate");
    }

    public function deactivateWorkflow(string $id): Response
    {
        return $this->post("/workflows/{$id}/deactivate");
    }

    public function publishWorkflow(string $id): Response
    {
        return $this->post("/workflows/{$id}/publish");
    }

    public function unpublishWorkflow(string $id): Response
    {
        return $this->post("/workflows/{$id}/unpublish");
    }

    public function archiveWorkflow(string $id): Response
    {
        return $this->post("/workflows/{$id}/archive");
    }

    public function unarchiveWorkflow(string $id): Response
    {
        return $this->post("/workflows/{$id}/unarchive");
    }

    public function getWorkflowHistory(string $id): Response
    {
        return $this->get("/workflows/{$id}/history");
    }

    public function getWorkflowVersion(string $id, string $versionId): Response
    {
        return $this->get("/workflows/{$id}/{$versionId}");
    }

    public function getWorkflowTags(string $id): Response
    {
        return $this->get("/workflows/{$id}/tags");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateWorkflowTags(string $id, array $payload): Response
    {
        return $this->put("/workflows/{$id}/tags", $payload);
    }

    /** @param  array<string, mixed>  $payload */
    public function transferWorkflow(string $id, array $payload): Response
    {
        return $this->put("/workflows/{$id}/transfer", $payload);
    }

    // ── Executions ─────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listExecutions(array $query = []): Response
    {
        return $this->get('/executions', $query);
    }

    public function getExecution(string $id): Response
    {
        return $this->get("/executions/{$id}");
    }

    public function deleteExecution(string $id): Response
    {
        return $this->delete("/executions/{$id}");
    }

    /** @param  array<string, mixed>  $payload */
    public function retryExecution(string $id, array $payload = []): Response
    {
        return $this->post("/executions/{$id}/retry", $payload);
    }

    public function stopExecution(string $id): Response
    {
        return $this->post("/executions/{$id}/stop");
    }

    /** @param  array<string, mixed>  $payload */
    public function stopExecutions(array $payload): Response
    {
        return $this->post('/executions/stop', $payload);
    }

    public function getExecutionTags(string $id): Response
    {
        return $this->get("/executions/{$id}/tags");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateExecutionTags(string $id, array $payload): Response
    {
        return $this->put("/executions/{$id}/tags", $payload);
    }

    // ── Credentials ────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listCredentials(array $query = []): Response
    {
        return $this->get('/credentials', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createCredential(array $payload): Response
    {
        return $this->post('/credentials', $payload);
    }

    public function getCredential(string $id): Response
    {
        return $this->get("/credentials/{$id}");
    }

    public function deleteCredential(string $id): Response
    {
        return $this->delete("/credentials/{$id}");
    }

    public function getCredentialSchema(string $credentialTypeName): Response
    {
        return $this->get("/credentials/schema/{$credentialTypeName}");
    }

    /** @param  array<string, mixed>  $payload */
    public function testCredential(string $id, array $payload = []): Response
    {
        return $this->post("/credentials/{$id}/test", $payload);
    }

    /** @param  array<string, mixed>  $payload */
    public function transferCredential(string $id, array $payload): Response
    {
        return $this->put("/credentials/{$id}/transfer", $payload);
    }

    // ── Users ──────────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listUsers(array $query = []): Response
    {
        return $this->get('/users', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createUser(array $payload): Response
    {
        return $this->post('/users', $payload);
    }

    public function getUser(string $id): Response
    {
        return $this->get("/users/{$id}");
    }

    public function deleteUser(string $id): Response
    {
        return $this->delete("/users/{$id}");
    }

    /** @param  array<string, mixed>  $payload */
    public function changeUserRole(string $id, array $payload): Response
    {
        return $this->patch("/users/{$id}/role", $payload);
    }

    // ── Variables ──────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listVariables(array $query = []): Response
    {
        return $this->get('/variables', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createVariable(array $payload): Response
    {
        return $this->post('/variables', $payload);
    }

    public function getVariable(string $id): Response
    {
        return $this->get("/variables/{$id}");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateVariable(string $id, array $payload): Response
    {
        return $this->put("/variables/{$id}", $payload);
    }

    public function deleteVariable(string $id): Response
    {
        return $this->delete("/variables/{$id}");
    }

    // ── Tags ───────────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listTags(array $query = []): Response
    {
        return $this->get('/tags', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createTag(array $payload): Response
    {
        return $this->post('/tags', $payload);
    }

    public function getTag(string $id): Response
    {
        return $this->get("/tags/{$id}");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateTag(string $id, array $payload): Response
    {
        return $this->put("/tags/{$id}", $payload);
    }

    public function deleteTag(string $id): Response
    {
        return $this->delete("/tags/{$id}");
    }

    // ── Projects ───────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listProjects(array $query = []): Response
    {
        return $this->get('/projects', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createProject(array $payload): Response
    {
        return $this->post('/projects', $payload);
    }

    public function getProject(string $projectId): Response
    {
        return $this->get("/projects/{$projectId}");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateProject(string $projectId, array $payload): Response
    {
        return $this->put("/projects/{$projectId}", $payload);
    }

    public function deleteProject(string $projectId): Response
    {
        return $this->delete("/projects/{$projectId}");
    }

    /** @param  array<string, mixed>  $query */
    public function listProjectUsers(string $projectId, array $query = []): Response
    {
        return $this->get("/projects/{$projectId}/users", $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function addProjectUser(string $projectId, array $payload): Response
    {
        return $this->post("/projects/{$projectId}/users", $payload);
    }

    public function removeProjectUser(string $projectId, string $userId): Response
    {
        return $this->delete("/projects/{$projectId}/users/{$userId}");
    }

    // ── Folders ────────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listFolders(string $projectId, array $query = []): Response
    {
        return $this->get("/projects/{$projectId}/folders", $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createFolder(string $projectId, array $payload): Response
    {
        return $this->post("/projects/{$projectId}/folders", $payload);
    }

    public function getFolder(string $projectId, string $folderId): Response
    {
        return $this->get("/projects/{$projectId}/folders/{$folderId}");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateFolder(string $projectId, string $folderId, array $payload): Response
    {
        return $this->put("/projects/{$projectId}/folders/{$folderId}", $payload);
    }

    public function deleteFolder(string $projectId, string $folderId): Response
    {
        return $this->delete("/projects/{$projectId}/folders/{$folderId}");
    }

    // ── Audit ──────────────────────────────────────────────────

    /** @param  array<string, mixed>  $payload */
    public function generateAudit(array $payload = []): Response
    {
        return $this->post('/audit', $payload);
    }

    // ── Source control ─────────────────────────────────────────

    /** @param  array<string, mixed>  $payload */
    public function sourceControlPull(array $payload = []): Response
    {
        return $this->post('/source-control/pull', $payload);
    }

    // ── Data tables ────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listDataTables(array $query = []): Response
    {
        return $this->get('/data-tables', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createDataTable(array $payload): Response
    {
        return $this->post('/data-tables', $payload);
    }

    public function getDataTable(string $dataTableId): Response
    {
        return $this->get("/data-tables/{$dataTableId}");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateDataTable(string $dataTableId, array $payload): Response
    {
        return $this->put("/data-tables/{$dataTableId}", $payload);
    }

    public function deleteDataTable(string $dataTableId): Response
    {
        return $this->delete("/data-tables/{$dataTableId}");
    }

    /** @param  array<string, mixed>  $query */
    public function listDataTableColumns(string $dataTableId, array $query = []): Response
    {
        return $this->get("/data-tables/{$dataTableId}/columns", $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createDataTableColumn(string $dataTableId, array $payload): Response
    {
        return $this->post("/data-tables/{$dataTableId}/columns", $payload);
    }

    public function deleteDataTableColumn(string $dataTableId, string $columnId): Response
    {
        return $this->delete("/data-tables/{$dataTableId}/columns/{$columnId}");
    }

    /** @param  array<string, mixed>  $query */
    public function listDataTableRows(string $dataTableId, array $query = []): Response
    {
        return $this->get("/data-tables/{$dataTableId}/rows", $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createDataTableRows(string $dataTableId, array $payload): Response
    {
        return $this->post("/data-tables/{$dataTableId}/rows", $payload);
    }

    public function clearDataTableRows(string $dataTableId): Response
    {
        return $this->post("/data-tables/{$dataTableId}/rows/clear");
    }

    /** @param  array<string, mixed>  $payload */
    public function deleteDataTableRows(string $dataTableId, array $payload): Response
    {
        return $this->post("/data-tables/{$dataTableId}/rows/delete", $payload);
    }

    /** @param  array<string, mixed>  $payload */
    public function updateDataTableRows(string $dataTableId, array $payload): Response
    {
        return $this->post("/data-tables/{$dataTableId}/rows/update", $payload);
    }

    /** @param  array<string, mixed>  $payload */
    public function upsertDataTableRows(string $dataTableId, array $payload): Response
    {
        return $this->post("/data-tables/{$dataTableId}/rows/upsert", $payload);
    }

    // ── Evaluation / test runs ─────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listTestRuns(string $workflowId, array $query = []): Response
    {
        return $this->get("/workflows/{$workflowId}/test-runs", $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function createTestRun(string $workflowId, array $payload = []): Response
    {
        return $this->post("/workflows/{$workflowId}/test-runs", $payload);
    }

    public function getTestRun(string $workflowId, string $runId): Response
    {
        return $this->get("/workflows/{$workflowId}/test-runs/{$runId}");
    }

    public function cancelTestRun(string $workflowId, string $runId): Response
    {
        return $this->post("/workflows/{$workflowId}/test-runs/{$runId}/cancel");
    }

    public function listTestCases(string $workflowId, string $runId): Response
    {
        return $this->get("/workflows/{$workflowId}/test-runs/{$runId}/test-cases");
    }

    // ── Insights ───────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function insightsSummary(array $query = []): Response
    {
        return $this->get('/insights/summary', $query);
    }

    // ── Community packages ─────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function listCommunityPackages(array $query = []): Response
    {
        return $this->get('/community-packages', $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function installCommunityPackage(array $payload): Response
    {
        return $this->post('/community-packages', $payload);
    }

    public function uninstallCommunityPackage(string $name): Response
    {
        return $this->delete("/community-packages/{$name}");
    }

    // ── n8n packages ───────────────────────────────────────────

    /** @param  array<string, mixed>  $payload */
    public function exportN8nPackages(array $payload = []): Response
    {
        return $this->post('/n8n-packages/export', $payload);
    }

    /** @param  array<string, mixed>  $payload */
    public function importN8nPackages(array $payload): Response
    {
        return $this->post('/n8n-packages/import', $payload);
    }

    // ── Log streaming ──────────────────────────────────────────

    public function listLogStreamingDestinations(): Response
    {
        return $this->get('/settings/log-streaming/destinations');
    }

    /** @param  array<string, mixed>  $payload */
    public function createLogStreamingDestination(array $payload): Response
    {
        return $this->post('/settings/log-streaming/destinations', $payload);
    }

    public function getLogStreamingDestination(string $id): Response
    {
        return $this->get("/settings/log-streaming/destinations/{$id}");
    }

    /** @param  array<string, mixed>  $payload */
    public function updateLogStreamingDestination(string $id, array $payload): Response
    {
        return $this->put("/settings/log-streaming/destinations/{$id}", $payload);
    }

    public function deleteLogStreamingDestination(string $id): Response
    {
        return $this->delete("/settings/log-streaming/destinations/{$id}");
    }

    public function testLogStreamingDestination(string $id): Response
    {
        return $this->post("/settings/log-streaming/destinations/{$id}/test");
    }

    public function listLogStreamingEventTypes(): Response
    {
        return $this->get('/settings/log-streaming/event-types');
    }

    // ── Discover ───────────────────────────────────────────────

    /** @param  array<string, mixed>  $query */
    public function discover(array $query = []): Response
    {
        return $this->get('/discover', $query);
    }

    // ── Settings SSO SAML ──────────────────────────────────────

    public function getSsoSamlSettings(): Response
    {
        return $this->get('/settings/sso/saml');
    }

    /** @param  array<string, mixed>  $payload */
    public function updateSsoSamlSettings(array $payload): Response
    {
        return $this->put('/settings/sso/saml', $payload);
    }

    // ── Settings OTEL ──────────────────────────────────────────

    public function getOtelSettings(): Response
    {
        return $this->get('/settings/otel');
    }

    /** @param  array<string, mixed>  $payload */
    public function updateOtelSettings(array $payload): Response
    {
        return $this->put('/settings/otel', $payload);
    }

    public function testOtelTrace(): Response
    {
        return $this->post('/settings/otel/test-trace');
    }

    // ── Security policy ────────────────────────────────────────

    public function getSecurityPolicy(): Response
    {
        return $this->get('/settings/security-policy');
    }

    /** @param  array<string, mixed>  $payload */
    public function updateSecurityPolicy(array $payload): Response
    {
        return $this->put('/settings/security-policy', $payload);
    }

    /**
     * Models resource is listed in n8n docs index; when the OpenAPI surface
     * publishes concrete paths they land under /models.
     *
     * @param  array<string, mixed>  $query
     */
    public function listModels(array $query = []): Response
    {
        return $this->get('/models', $query);
    }

    /** @param  array<string, mixed>  $query */
    public function get(string $path, array $query = []): Response
    {
        return $this->http()->get($this->url($path), $query);
    }

    /** @param  array<string, mixed>  $payload */
    public function post(string $path, array $payload = []): Response
    {
        return $this->http()->post($this->url($path), $payload);
    }

    /** @param  array<string, mixed>  $payload */
    public function put(string $path, array $payload = []): Response
    {
        return $this->http()->put($this->url($path), $payload);
    }

    /** @param  array<string, mixed>  $payload */
    public function patch(string $path, array $payload = []): Response
    {
        return $this->http()->patch($this->url($path), $payload);
    }

    public function delete(string $path): Response
    {
        return $this->http()->delete($this->url($path));
    }

    private function http(): PendingRequest
    {
        if ($this->apiKey === '') {
            throw new RuntimeException('n8n API key is required.');
        }

        return Http::withHeaders([
            'X-N8N-API-KEY' => $this->apiKey,
            'Accept' => 'application/json',
        ])
            ->timeout($this->timeout)
            ->acceptJson();
    }

    private function url(string $path): string
    {
        return $this->baseUrl.'/'.ltrim($path, '/');
    }
}
