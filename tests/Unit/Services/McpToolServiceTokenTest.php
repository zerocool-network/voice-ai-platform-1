<?php

namespace Tests\Unit\Services;

use App\Services\McpToolService;
use Laravel\Mcp\Client\Transport\HttpTransport;
use Laravel\Mcp\WebClient;
use ReflectionMethod;
use ReflectionProperty;
use Tests\TestCase;

class McpToolServiceTokenTest extends TestCase
{
    public function test_http_client_applies_with_token_when_configured(): void
    {
        $service = new McpToolService;
        $method = new ReflectionMethod(McpToolService::class, 'createHttpClient');

        /** @var WebClient $client */
        $client = $method->invoke($service, [
            'transport' => 'http',
            'url' => 'https://mcp.example.com',
            'token' => 'secret-token',
        ]);

        $this->assertInstanceOf(WebClient::class, $client);
        $this->assertSame('secret-token', $this->transportToken($client));
    }

    public function test_http_client_omits_token_when_empty(): void
    {
        $service = new McpToolService;
        $method = new ReflectionMethod(McpToolService::class, 'createHttpClient');

        /** @var WebClient $client */
        $client = $method->invoke($service, [
            'transport' => 'http',
            'url' => 'https://mcp.example.com',
            'token' => '',
        ]);

        $this->assertNull($this->transportToken($client));
    }

    public function test_call_tool_returns_generic_error_text(): void
    {
        config([
            'mcp-servers.servers.broken' => [
                'transport' => 'http',
                'url' => 'https://mcp.invalid.example',
                'token' => 'x',
                'timeout' => 1,
            ],
        ]);

        $service = new McpToolService;
        $result = $service->callTool('broken', 'noop', []);

        $this->assertTrue($result['isError']);
        $this->assertSame('MCP tool call failed.', $result['text']);
        $this->assertStringNotContainsString('mcp.invalid', $result['text']);
    }

    private function transportToken(WebClient $client): mixed
    {
        $transportProp = new ReflectionProperty(WebClient::class, 'httpTransport');
        /** @var HttpTransport $transport */
        $transport = $transportProp->getValue($client);

        $tokenProp = new ReflectionProperty(HttpTransport::class, 'token');

        return $tokenProp->getValue($transport);
    }
}
