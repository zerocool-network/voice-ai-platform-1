<?php

namespace Tests\Unit\Domain\Flow;

use App\Domain\Flow\ValueObjects\StepType;
use PHPUnit\Framework\TestCase;

class StepTypeTest extends TestCase
{
    public function test_all_cases_present(): void
    {
        $cases = StepType::cases();

        $this->assertCount(12, $cases);
    }

    public function test_say_case(): void
    {
        $this->assertEquals('say', StepType::Say->value);
    }

    public function test_hangup_case(): void
    {
        $this->assertEquals('hangup', StepType::Hangup->value);
    }

    public function test_llm_case(): void
    {
        $this->assertEquals('llm', StepType::Llm->value);
    }

    public function test_condition_case(): void
    {
        $this->assertEquals('condition', StepType::Condition->value);
    }

    public function test_goto_case(): void
    {
        $this->assertEquals('goto', StepType::Goto->value);
    }

    public function test_mcp_tool_case(): void
    {
        $this->assertEquals('mcp_tool', StepType::McpTool->value);
    }

    public function test_knowledge_case(): void
    {
        $this->assertEquals('knowledge', StepType::Knowledge->value);
    }

    public function test_transfer_case(): void
    {
        $this->assertEquals('transfer', StepType::Transfer->value);
    }

    public function test_voice_agent_case(): void
    {
        $this->assertEquals('voice_agent', StepType::VoiceAgent->value);
    }

    public function test_analyze_case(): void
    {
        $this->assertEquals('analyze', StepType::Analyze->value);
    }

    public function test_memory_case(): void
    {
        $this->assertEquals('memory', StepType::Memory->value);
    }

    public function test_from_string(): void
    {
        $this->assertEquals(StepType::Say, StepType::from('say'));
        $this->assertEquals(StepType::Llm, StepType::from('llm'));
        $this->assertEquals(StepType::Hangup, StepType::from('hangup'));
    }
}
