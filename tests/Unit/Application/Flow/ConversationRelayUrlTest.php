<?php

namespace Tests\Unit\Application\Flow;

use App\Application\Flow\Services\ConversationRelayUrl;
use App\Application\Flow\Services\TwilioPublicUrl;
use Tests\TestCase;

class ConversationRelayUrlTest extends TestCase
{
    public function test_prefers_explicit_relay_url(): void
    {
        config([
            'twilio.relay_url' => 'wss://relay.example.com/twilio/relay',
            'twilio.webhook_base_url' => 'https://voice-ai-platform.hifenix.com',
        ]);

        $this->assertSame('wss://relay.example.com/twilio/relay', ConversationRelayUrl::websocket());
    }

    public function test_derives_wss_from_webhook_tunnel_without_custom_port(): void
    {
        config([
            'twilio.relay_url' => null,
            'twilio.webhook_base_url' => 'https://voice-ai-platform.hifenix.com',
            'twilio.relay_path' => '/twilio/relay',
            'twilio.relay_port' => 9091,
            'app.url' => 'https://voice-ai-platform.test',
        ]);

        $url = ConversationRelayUrl::websocket();

        $this->assertSame('wss://voice-ai-platform.hifenix.com/twilio/relay', $url);
        $this->assertStringStartsWith('wss://', $url);
        $this->assertStringNotContainsString(':9091', $url);
    }

    public function test_falls_back_to_app_url_with_relay_port_when_no_tunnel(): void
    {
        config([
            'twilio.relay_url' => null,
            'twilio.webhook_base_url' => null,
            'app.url' => 'https://voice-ai-platform.test',
            'twilio.relay_path' => '/twilio/relay',
            'twilio.relay_port' => 9091,
        ]);

        $this->assertSame('wss://voice-ai-platform.test:9091/twilio/relay', ConversationRelayUrl::websocket());
    }

    public function test_http_app_url_uses_ws_scheme(): void
    {
        config([
            'twilio.relay_url' => null,
            'twilio.webhook_base_url' => null,
            'app.url' => 'http://localhost',
            'twilio.relay_path' => '/twilio/relay',
            'twilio.relay_port' => 9091,
        ]);

        $this->assertSame('ws://localhost:9091/twilio/relay', ConversationRelayUrl::websocket());
    }

    public function test_public_url_uses_webhook_base(): void
    {
        config([
            'twilio.webhook_base_url' => 'https://voice-ai-platform.hifenix.com',
            'app.url' => 'https://voice-ai-platform.test',
        ]);

        $this->assertSame('https://voice-ai-platform.hifenix.com', TwilioPublicUrl::base());
        $this->assertSame(
            'https://voice-ai-platform.hifenix.com/twilio/inbound',
            TwilioPublicUrl::to('/twilio/inbound'),
        );
    }
}
