<?php

namespace App\Application\Call\UseCases;

use App\Application\Call\DTOs\InboundCallData;
use App\Domain\Call\Entities\Call;
use App\Domain\Call\Events\CallStarted;
use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

class HandleInboundCall
{
    public function __construct(
        private readonly CallRepositoryInterface $callRepository,
        private readonly TenantRepositoryInterface $tenantRepository,
        private readonly FlowRepositoryInterface $flowRepository,
    ) {}

    public function execute(InboundCallData $data): Call
    {
        // Resolve flow: use explicit flow_id if provided, otherwise look up by phone number
        $flow = $data->flowId !== null
            ? $this->flowRepository->findById($data->flowId)
            : $this->flowRepository->findByPhoneNumber($data->toNumber);
        $tenantId = $data->tenantId ?? $flow?->tenantId();

        $tenant = $tenantId ? $this->tenantRepository->findById($tenantId) : null;

        if (! $tenant || ! $tenant->isActive()) {
            throw new \RuntimeException('Tenant not found or inactive');
        }

        $call = new Call(
            id: (string) Str::uuid(),
            tenantId: $tenantId,
            flowId: $flow?->getId(),
            callSid: new CallSid($data->callSid),
            fromNumber: new PhoneNumber($this->normalizePhone($data->fromNumber)),
            toNumber: new PhoneNumber($this->normalizePhone($data->toNumber)),
            status: 'initiated',
            context: []
        );

        $call->markInProgress();

        if ($flow !== null) {
            $call->setCurrentStep($flow->config()->startStep());
        }

        $this->callRepository->save($call);

        Event::dispatch(new CallStarted($call));

        return $call;
    }

    private function normalizePhone(string $number): string
    {
        $cleaned = preg_replace('/[^+\d]/', '', $number) ?? '';

        if ($cleaned !== '' && preg_match('/^\+[1-9]\d{6,14}$/', $cleaned)) {
            return $cleaned;
        }

        return '+10000000000';
    }
}
