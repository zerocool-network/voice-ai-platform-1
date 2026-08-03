<?php

namespace App\Console\Commands;

use App\Application\Flow\Services\ConversationRelayDisconnect;
use App\Application\Flow\Services\ConversationRelayHandler;
use App\Application\Flow\Services\ConversationRelayUrl;
use Illuminate\Console\Command;
use WebSocket\ConnectionException;
use WebSocket\Server;

class ServeTwilioConversationRelay extends Command
{
    protected $signature = 'twilio:relay
                            {--port= : Port to listen on (default config twilio.relay_port)}';

    protected $description = 'Serve the Twilio ConversationRelay WebSocket endpoint';

    public function handle(): int
    {
        $port = (int) ($this->option('port') ?: config('twilio.relay_port', 9091));

        $this->info("ConversationRelay WebSocket listening on 0.0.0.0:{$port}");
        $this->line('Public URL Twilio will call: '.ConversationRelayUrl::websocket());
        $this->line('Ensure your tunnel (TWILIO_WEBHOOK_BASE_URL) proxies /twilio/relay → this port.');
        $this->line('Success criterion for a Test Call: log line "← setup" (Twilio ConversationRelay protocol).');

        // Do not set textalk "timeout": it also stream_set_timeout()s the active
        // socket and can drop live Twilio sessions after idle silence (error 64105).
        $server = new Server([
            'port' => $port,
        ]);

        while ($server->accept()) {
            $sessionHandler = app(ConversationRelayHandler::class);
            $sawTwilioMessage = false;

            try {
                while (true) {
                    $raw = $server->receive();

                    if (! is_string($raw) || $raw === '') {
                        continue;
                    }

                    /** @var array<string, mixed>|null $incoming */
                    $incoming = json_decode($raw, true);

                    if (! is_array($incoming)) {
                        $this->warn('Invalid JSON from Twilio ConversationRelay');

                        continue;
                    }

                    $sawTwilioMessage = true;
                    $this->logIncoming($incoming);

                    foreach ($sessionHandler->handle($incoming) as $outbound) {
                        $payload = json_encode($outbound, JSON_THROW_ON_ERROR);
                        $server->text($payload);
                        $this->line('→ '.($outbound['type'] ?? 'unknown'));
                    }
                }
            } catch (ConnectionException $e) {
                $this->handleDisconnect($e->getMessage(), $sawTwilioMessage);
            } catch (\Throwable $e) {
                $this->error($e->getMessage());
            } finally {
                try {
                    $server->close();
                } catch (\Throwable) {
                    //
                }
            }
        }

        return self::SUCCESS;
    }

    /** @param  array<string, mixed>  $incoming */
    private function logIncoming(array $incoming): void
    {
        $type = (string) ($incoming['type'] ?? 'unknown');

        if ($type === 'error') {
            $this->warn('← error: '.(string) ($incoming['description'] ?? 'unknown'));

            return;
        }

        $this->line('← '.$type);
    }

    private function handleDisconnect(string $message, bool $sawTwilioMessage): void
    {
        if (! $sawTwilioMessage && ConversationRelayDisconnect::isBenign($message)) {
            if ($this->output->isVerbose()) {
                $this->line('Ignored non-Twilio probe/accept: '.$message);
            }

            return;
        }

        if ($sawTwilioMessage) {
            $this->warn('ConversationRelay session closed (investigate Twilio 64105 if unexpected): '.$message);

            return;
        }

        $this->warn('Connection closed: '.$message);
    }
}
