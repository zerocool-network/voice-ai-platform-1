<?php

namespace Tests\Unit\Application\Flow;

use App\Application\Flow\Services\FlowExecutor;
use App\Domain\Call\Entities\Call;
use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Domain\Knowledge\Services\KnowledgeRetrievalService;
use App\Services\ConversationMemoryService;
use PHPUnit\Framework\TestCase;

class FlowExecutorTest extends TestCase
{
    private FlowExecutor $executor;

    private AiServiceInterface $aiService;

    private KnowledgeRetrievalService $knowledgeRetrieval;

    private ConversationMemoryService $memoryService;

    protected function setUp(): void
    {
        $this->aiService = new class implements AiServiceInterface
        {
            public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
            {
                return 'This is a mock AI response.';
            }
        };

        $this->knowledgeRetrieval = $this->createMock(KnowledgeRetrievalService::class);

        $this->memoryService = $this->createMock(ConversationMemoryService::class);

        $this->executor = new FlowExecutor($this->aiService, $this->knowledgeRetrieval, $this->memoryService);
    }

    private function makeFlow(array $steps): Flow
    {
        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => $steps,
        ]);

        return new Flow(
            id: 'flow-1',
            tenantId: 'tenant-1',
            name: 'Test Flow',
            description: null,
            phoneNumber: '+19876543210',
            config: $config,
        );
    }

    private function makeCall(): Call
    {
        return new Call(
            id: 'call-1',
            tenantId: 'tenant-1',
            flowId: 'flow-1',
            callSid: new CallSid('CA'.str_repeat('a', 32)),
            fromNumber: new PhoneNumber('+12345678901'),
            toNumber: new PhoneNumber('+19876543210'),
        );
    }

    public function test_say_step_returns_twiml_with_say(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello world'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Say', $xml);
        $this->assertStringContainsString('Hello world', $xml);
        $this->assertStringContainsString('language="en-US"', $xml);
        $this->assertStringContainsString('voice="Polly.Joanna"', $xml);
        $this->assertStringContainsString('<Redirect>/twilio/step</Redirect>', $xml);
    }

    public function test_say_step_uses_flow_language_bcp47(): void
    {
        $config = FlowConfig::fromArray([
            'start_step' => 's1',
            'steps' => [
                's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hola mundo'], 'next' => null],
            ],
        ]);

        $flow = new Flow(
            id: 'flow-es',
            tenantId: 'tenant-1',
            name: 'Spanish Flow',
            description: null,
            phoneNumber: null,
            config: $config,
            language: 'es-ES',
        );

        $xml = (string) $this->executor->executeStep('s1', $flow);

        $this->assertStringContainsString('language="es-ES"', $xml);
        $this->assertStringContainsString('voice="Polly.Lucia"', $xml);
        $this->assertStringContainsString('Hola mundo', $xml);
    }

    public function test_say_step_variable_resolution(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Welcome to {{flow_name}}'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('Welcome to Test Flow', $xml);
        $this->assertStringContainsString('<Redirect>/twilio/step</Redirect>', $xml);
    }

    public function test_say_step_no_next_omits_redirect(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Done']],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('Done', $xml);
        $this->assertStringContainsString('<Say', $xml);
        $this->assertStringNotContainsString('<Redirect>', $xml);
    }

    public function test_ask_dtmf_step_returns_gather(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'ask', 'config' => ['prompt' => 'Press 1 for sales', 'inputType' => 'dtmf', 'num_digits' => 1], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Gather', $xml);
        $this->assertStringContainsString('numDigits="1"', $xml);
        $this->assertStringContainsString('Press 1 for sales', $xml);
    }

    public function test_ask_speech_step_returns_gather_with_input_speech(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'ask', 'config' => ['prompt' => 'Tell me your name', 'inputType' => 'speech', 'timeoutSec' => 10], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Gather', $xml);
        $this->assertStringContainsString('input="speech"', $xml);
        $this->assertStringContainsString('timeout="10"', $xml);
        $this->assertStringContainsString('Tell me your name', $xml);
    }

    public function test_llm_step_calls_ai_and_returns_twiml(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'llm', 'config' => ['systemPrompt' => 'You are a bot'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow, $this->makeCall());

        $xml = (string) $response;
        $this->assertStringContainsString('This is a mock AI response.', $xml);
    }

    public function test_llm_step_handles_ai_exception(): void
    {
        $aiService = new class implements AiServiceInterface
        {
            public function chat(array $messages, float $temperature = 0.7, int $maxTokens = 512): string
            {
                throw new \RuntimeException('API error');
            }
        };

        $executor = new FlowExecutor($aiService, $this->knowledgeRetrieval, $this->memoryService);
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'llm', 'config' => ['systemPrompt' => 'You are a bot'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $executor->executeStep('s1', $flow, $this->makeCall());

        $xml = (string) $response;
        $this->assertStringContainsString('having trouble processing', $xml);
    }

    public function test_hangup_step_returns_hangup(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Hangup/>', $xml);
        $this->assertStringNotContainsString('<Redirect>', $xml);
    }

    public function test_transfer_step_dials_number(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '+15551234567']],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Dial>+15551234567</Dial>', $xml);
    }

    public function test_transfer_step_dials_sip(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'transfer', 'config' => ['destination' => 'sip', 'value' => 'user@example.com']],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Sip>user@example.com</Sip>', $xml);
    }

    public function test_transfer_step_no_value_says_error(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '']],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('No destination configured', $xml);
        $this->assertStringContainsString('<Hangup/>', $xml);
    }

    public function test_goto_step_redirects(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'goto', 'config' => ['target' => 's3'], 'next' => 's3'],
            's3' => ['id' => 's3', 'type' => 'say', 'config' => ['text' => 'Jumped'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Redirect>/twilio/step</Redirect>', $xml);
    }

    public function test_goto_step_no_target_says_error(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'goto', 'config' => []],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('No target specified.', $xml);
    }

    public function test_condition_step_redirects(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'condition', 'config' => ['branches' => [['label' => 'Yes', 'expression' => 'true', 'next' => 's2']], 'elseNext' => 's3'], 'next' => 's3'],
            's2' => ['id' => 's2', 'type' => 'say', 'config' => ['text' => 'Yes branch'], 'next' => 'hangup'],
            's3' => ['id' => 's3', 'type' => 'say', 'config' => ['text' => 'No branch'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('<Redirect>/twilio/step</Redirect>', $xml);
    }

    public function test_condition_step_no_branches_says_error(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'condition', 'config' => []],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('Condition not resolved.', $xml);
        $this->assertStringContainsString('<Hangup/>', $xml);
    }

    public function test_webhook_step_redirects_on_no_url(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'webhook', 'config' => [], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('s1', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('Webhook URL not configured.', $xml);
        $this->assertStringContainsString('<Redirect>', $xml);
    }

    public function test_unknown_step_type_throws(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Unknown step type: invalid');

        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'invalid', 'config' => []],
        ]);

        $this->executor->executeStep('s1', $flow);
    }

    public function test_missing_step_returns_error(): void
    {
        $flow = $this->makeFlow([
            's1' => ['id' => 's1', 'type' => 'say', 'config' => ['text' => 'Hello'], 'next' => 'hangup'],
            'hangup' => ['id' => 'hangup', 'type' => 'hangup'],
        ]);

        $response = $this->executor->executeStep('nonexistent', $flow);

        $xml = (string) $response;
        $this->assertStringContainsString('step not found', $xml);
        $this->assertStringContainsString('<Hangup/>', $xml);
    }

    public function test_determine_next_step_returns_next_for_simple_step(): void
    {
        $next = $this->executor->determineNextStep(
            ['id' => 's1', 'type' => 'say', 'config' => [], 'next' => 'hangup'],
            null,
        );

        $this->assertEquals('hangup', $next);
    }

    public function test_determine_next_step_returns_null_for_hangup(): void
    {
        $next = $this->executor->determineNextStep(
            ['id' => 's1', 'type' => 'hangup', 'config' => []],
            null,
        );

        $this->assertNull($next);
    }

    public function test_determine_next_step_returns_null_for_transfer(): void
    {
        $next = $this->executor->determineNextStep(
            ['id' => 's1', 'type' => 'transfer', 'config' => ['destination' => 'number', 'value' => '+15551234567']],
            null,
        );

        $this->assertNull($next);
    }

    public function test_determine_next_step_for_goto_returns_target(): void
    {
        $next = $this->executor->determineNextStep(
            ['id' => 's1', 'type' => 'goto', 'config' => ['target' => 's3']],
            null,
        );

        $this->assertEquals('s3', $next);
    }

    public function test_determine_next_step_for_condition_returns_branch(): void
    {
        $next = $this->executor->determineNextStep(
            [
                'id' => 's1',
                'type' => 'condition',
                'config' => [
                    'branches' => [
                        ['label' => 'Yes', 'expression' => '', 'next' => 's2'],
                    ],
                    'elseNext' => 's3',
                ],
            ],
            null,
        );

        $this->assertEquals('s2', $next);
    }

    public function test_determine_next_step_for_condition_returns_else(): void
    {
        $step = [
            'id' => 's1',
            'type' => 'condition',
            'config' => [
                'branches' => [],
                'elseNext' => 's3',
            ],
        ];

        $next = $this->executor->determineNextStep($step, null);

        $this->assertEquals('s3', $next);
    }

    public function test_determine_next_step_for_condition_false_expression_uses_else(): void
    {
        $next = $this->executor->determineNextStep(
            [
                'id' => 's1',
                'type' => 'condition',
                'config' => [
                    'branches' => [
                        ['label' => 'Yes', 'expression' => 'false', 'next' => 's2'],
                    ],
                    'elseNext' => 's3',
                ],
            ],
            null,
        );

        $this->assertEquals('s3', $next);
    }

    public function test_determine_next_step_for_condition_variable_expression(): void
    {
        $next = $this->executor->determineNextStep(
            [
                'id' => 's1',
                'type' => 'condition',
                'config' => [
                    'branches' => [
                        ['label' => 'Match', 'expression' => "input == '1'", 'next' => 's2'],
                    ],
                    'elseNext' => 's3',
                ],
            ],
            null,
            ['input' => '1'],
        );

        $this->assertEquals('s2', $next);
    }
}
