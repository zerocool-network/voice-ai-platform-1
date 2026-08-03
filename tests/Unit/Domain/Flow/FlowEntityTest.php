<?php

namespace Tests\Unit\Domain\Flow;

use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\ValueObjects\FlowConfig;
use PHPUnit\Framework\TestCase;

class FlowEntityTest extends TestCase
{
    private Flow $flow;

    protected function setUp(): void
    {
        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => ['s1' => ['type' => 'say']],
        ]);

        $this->flow = new Flow(
            id: 'flow-1',
            tenantId: 'tenant-1',
            name: 'Test Flow',
            description: 'A test flow',
            phoneNumber: '+12345678901',
            config: $config,
            isActive: true,
            version: 1,
        );
    }

    public function test_getters(): void
    {
        $this->assertEquals('flow-1', $this->flow->getId());
        $this->assertEquals('tenant-1', $this->flow->getTenantId());
        $this->assertEquals('Test Flow', $this->flow->getName());
        $this->assertEquals('A test flow', $this->flow->getDescription());
        $this->assertEquals('+12345678901', $this->flow->getPhoneNumber());
        $this->assertTrue($this->flow->isActive());
        $this->assertEquals(1, $this->flow->getVersion());
        $this->assertEquals('en-US', $this->flow->language());
    }

    public function test_shorthand_getters(): void
    {
        $this->assertEquals($this->flow->getId(), $this->flow->id());
        $this->assertEquals($this->flow->getName(), $this->flow->name());
    }

    public function test_get_config_returns_array(): void
    {
        $config = $this->flow->getConfig();

        $this->assertIsArray($config);
        $this->assertArrayHasKey('start_step', $config);
        $this->assertArrayHasKey('steps', $config);
    }

    public function test_config_returns_flow_config_object(): void
    {
        $config = $this->flow->config();

        $this->assertInstanceOf(FlowConfig::class, $config);
        $this->assertEquals('s1', $config->startStep());
    }

    public function test_flow_without_description(): void
    {
        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => ['s1' => ['type' => 'say']],
        ]);

        $flow = new Flow(
            id: 'flow-2',
            tenantId: 'tenant-1',
            name: 'No desc',
            description: null,
            phoneNumber: null,
            config: $config,
        );

        $this->assertNull($flow->getDescription());
        $this->assertNull($flow->getPhoneNumber());
    }

    public function test_version_getter(): void
    {
        $this->assertEquals(1, $this->flow->version());
    }
}
