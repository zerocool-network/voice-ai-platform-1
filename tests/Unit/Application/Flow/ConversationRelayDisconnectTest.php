<?php

namespace Tests\Unit\Application\Flow;

use App\Application\Flow\Services\ConversationRelayDisconnect;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class ConversationRelayDisconnectTest extends TestCase
{
    #[DataProvider('benignMessages')]
    public function test_identifies_benign_disconnects(string $message): void
    {
        $this->assertTrue(ConversationRelayDisconnect::isBenign($message));
    }

    #[DataProvider('realMessages')]
    public function test_identifies_real_disconnects(string $message): void
    {
        $this->assertFalse(ConversationRelayDisconnect::isBenign($message));
    }

    /** @return list<array{string}> */
    public static function benignMessages(): array
    {
        return [
            ['No GET in request: '],
            ['No GET in request: GET /health'],
            ['Client had no Key in upgrade request: HEAD /'],
            ['Server failed to connect. stream_socket_accept(): Accept failed: Operation timed out'],
            ['Accept failed: Operation timed out'],
            ['stream_socket_accept(): Accept failed: Operation timed out'],
        ];
    }

    /** @return list<array{string}> */
    public static function realMessages(): array
    {
        return [
            ['Connection closed unexpectedly'],
            ['Broken pipe'],
            ['Client disconnected'],
            ['Empty message received'],
        ];
    }
}
