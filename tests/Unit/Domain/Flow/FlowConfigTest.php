<?php

namespace Tests\Unit\Domain\Flow;

use App\Domain\Flow\ValueObjects\FlowConfig;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class FlowConfigTest extends TestCase
{
    public function test_from_array_returns_config(): void
    {
        $config = FlowConfig::fromArray([
            'start_step' => 'step_1',
            'steps' => [
                'step_1' => ['type' => 'say', 'config' => ['text' => 'Hello']],
            ],
        ]);

        $this->assertEquals('step_1', $config->startStep());
        $this->assertCount(1, $config->steps());
    }

    public function test_throws_when_start_step_missing(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Missing start_step');

        FlowConfig::fromArray(['steps' => []]);
    }

    public function test_throws_when_steps_missing(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Missing steps');

        FlowConfig::fromArray(['start_step' => 's1']);
    }

    public function test_throws_when_start_step_not_in_steps(): void
    {
        $this->expectException(InvalidArgumentException::class);

        FlowConfig::fromArray([
            'start_step' => 'missing',
            'steps' => ['other' => ['type' => 'say']],
        ]);
    }

    public function test_throws_when_steps_empty(): void
    {
        $this->expectException(InvalidArgumentException::class);

        FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => [],
        ]);
    }

    public function test_to_array_roundtrip(): void
    {
        $data = [
            'start_step' => 'start',
            'steps' => [
                'start' => ['type' => 'say', 'config' => ['text' => 'Hi']],
                'end' => ['type' => 'hangup'],
            ],
        ];

        $config = FlowConfig::fromArray($data);

        $this->assertEquals($data, $config->toArray());
    }

    public function test_get_step_returns_null_for_missing(): void
    {
        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => ['s1' => ['type' => 'say']],
        ]);

        $this->assertNull($config->getStep('nonexistent'));
    }

    public function test_get_step_returns_step_data(): void
    {
        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => ['s1' => ['type' => 'say', 'config' => ['text' => 'Hi']]],
        ]);

        $step = $config->getStep('s1');

        $this->assertIsArray($step);
        $this->assertEquals('say', $step['type']);
    }

    public function test_preserves_step_positions_on_roundtrip(): void
    {
        $data = [
            'start_step' => 'start',
            'steps' => [
                'start' => [
                    'type' => 'say',
                    'config' => ['text' => 'Hello'],
                    'next' => 'end',
                    'position' => ['x' => 120, 'y' => 240],
                ],
                'end' => [
                    'type' => 'hangup',
                    'position' => ['x' => 400, 'y' => 240],
                ],
            ],
        ];

        $config = FlowConfig::fromArray($data);

        $this->assertSame($data, $config->toArray());
        $this->assertSame(['x' => 120, 'y' => 240], $config->getStep('start')['position']);
    }
}
