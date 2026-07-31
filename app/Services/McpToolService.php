<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Laravel\Mcp\Client;
use Laravel\Mcp\Client\Primitives\Tool;

class McpToolService
{
    /** @var array<string, Client> */
    private array $clients = [];

    /** @var array<string, Collection<string, Tool>> */
    private array $toolsCache = [];

    /** @return array<int, array{server: string, name: string, title: ?string, description: ?string, inputSchema: array}> */
    public function getDispatcherTools(): array
    {
        $all = [];

        foreach ($this->getServerNames() as $serverName) {
            $tools = $this->getServerTools($serverName);

            foreach ($tools as $tool) {
                $all[] = [
                    'server' => $serverName,
                    'name' => $tool->name,
                    'title' => $tool->title,
                    'description' => $tool->description,
                    'inputSchema' => $tool->inputSchema,
                ];
            }
        }

        return $all;
    }

    /** @return Collection<string, Tool> */
    public function getServerTools(string $serverName): Collection
    {
        if (isset($this->toolsCache[$serverName])) {
            return $this->toolsCache[$serverName];
        }

        try {
            $client = $this->client($serverName);
            $this->toolsCache[$serverName] = $client->tools();
        } catch (\Throwable $e) {
            Log::warning("MCP: Failed to list tools for server '{$serverName}'", [
                'error' => $e->getMessage(),
            ]);
            $this->toolsCache[$serverName] = collect();
        }

        return $this->toolsCache[$serverName];
    }

    /** @param array<string, mixed> $arguments */
    public function callTool(string $serverName, string $toolName, array $arguments = []): array
    {
        try {
            $client = $this->client($serverName);
            $result = $client->callTool($toolName, $arguments);

            return [
                'content' => $result->content,
                'isError' => $result->isError,
                'text' => $result->text(),
            ];
        } catch (\Throwable $e) {
            Log::warning('MCP: Tool call failed', [
                'server' => $serverName,
                'tool' => $toolName,
                'error' => $e->getMessage(),
            ]);

            return [
                'content' => [['type' => 'text', 'text' => "Error: {$e->getMessage()}"]],
                'isError' => true,
                'text' => "Error: {$e->getMessage()}",
            ];
        }
    }

    /** @return array<int, string> */
    public function getServerNames(): array
    {
        return array_keys(config('mcp-servers.servers', []));
    }

    private function client(string $name): Client
    {
        if (isset($this->clients[$name])) {
            return $this->clients[$name]->connect();
        }

        $config = config("mcp-servers.servers.{$name}");

        if ($config === null) {
            throw new \RuntimeException("MCP server '{$name}' not configured.");
        }

        $transport = $config['transport'] ?? 'stdio';

        $client = match ($transport) {
            'http' => Client::web($config['url'] ?? ''),
            default => Client::local($config['command'] ?? '', $config['args'] ?? []),
        };

        if (isset($config['timeout'])) {
            $client->withTimeout((float) $config['timeout']);
        }

        return $this->clients[$name] = $client;
    }

    public function __destruct()
    {
        foreach ($this->clients as $client) {
            try {
                $client->disconnect();
            } catch (\Throwable) {
                //
            }
        }
    }
}
