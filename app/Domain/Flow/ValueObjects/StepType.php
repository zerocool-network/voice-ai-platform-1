<?php

namespace App\Domain\Flow\ValueObjects;

enum StepType: string
{
    case Say = 'say';
    case Ask = 'ask';
    case Llm = 'llm';
    case Condition = 'condition';
    case Goto = 'goto';
    case McpTool = 'mcp_tool';
    case Transfer = 'transfer';
    case Knowledge = 'knowledge';
    case Hangup = 'hangup';
    case VoiceAgent = 'voice_agent';
    case Analyze = 'analyze';
    case Memory = 'memory';
}
