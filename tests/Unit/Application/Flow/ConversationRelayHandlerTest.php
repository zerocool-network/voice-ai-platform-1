<?php

namespace Tests\Unit\Application\Flow;

use App\Application\Flow\Services\ConversationRelayHandler;
use App\Domain\Flow\Services\AiServiceInterface;
use PHPUnit\Framework\TestCase;

class ConversationRelayHandlerTest extends TestCase
{
    public function test_setup_stores_custom_parameters(): void
    {
        $handler = new ConversationRelayHandler($this->ai('unused'));

        $handler->handle([
            'type' => 'setup',
            'callSid' => 'CA'.str_repeat('a', 32),
            'customParameters' => [
                'systemPrompt' => 'Be brief.',
            ],
        ]);

        $this->assertSame('Be brief.', $handler->session()['systemPrompt']);
        $this->assertSame('CA'.str_repeat('a', 32), $handler->session()['callSid']);
    }

    public function test_partial_prompt_is_ignored(): void
    {
        $handler = new ConversationRelayHandler($this->ai('should-not-call'));

        $out = $handler->handle([
            'type' => 'setup',
            'customParameters' => ['systemPrompt' => 'Hi'],
        ]);
        $this->assertSame([], $out);

        $out = $handler->handle([
            'type' => 'prompt',
            'voicePrompt' => 'Hello',
            'last' => false,
        ]);

        $this->assertSame([], $out);
    }

    public function test_final_prompt_returns_text_token(): void
    {
        $handler = new ConversationRelayHandler($this->ai('Hello caller'));

        $handler->handle([
            'type' => 'setup',
            'customParameters' => ['systemPrompt' => 'You are Nora.'],
        ]);

        $out = $handler->handle([
            'type' => 'prompt',
            'voicePrompt' => 'Hi there',
            'last' => true,
        ]);

        $this->assertCount(1, $out);
        $this->assertSame('text', $out[0]['type']);
        $this->assertSame('Hello caller', $out[0]['token']);
        $this->assertTrue($out[0]['last']);
    }

    private function ai(string $reply): AiServiceInterface
    {
        return new class($reply) implements AiServiceInterface
        {
            public function __construct(private string $reply) {}

            public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
            {
                return $this->reply;
            }
        };
    }
}
