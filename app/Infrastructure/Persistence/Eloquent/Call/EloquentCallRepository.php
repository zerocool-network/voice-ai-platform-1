<?php

namespace App\Infrastructure\Persistence\Eloquent\Call;

use App\Domain\Call\Entities\Call;
use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Call\ValueObjects\CallSid;
use App\Domain\Call\ValueObjects\PhoneNumber;

class EloquentCallRepository implements CallRepositoryInterface
{
    public function findById(string $id): ?Call
    {
        $model = CallModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function findBySid(string $callSid): ?Call
    {
        $model = CallModel::where('call_sid', $callSid)->first();

        return $model ? $this->toEntity($model) : null;
    }

    /** @return Call[] */
    public function findByTenant(string $tenantId): array
    {
        return CallModel::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (CallModel $model) => $this->toEntity($model))
            ->all();
    }

    public function save(Call $call): void
    {
        $data = [
            'id' => $call->id(),
            'tenant_id' => $call->tenantId(),
            'flow_id' => $call->flowId(),
            'call_sid' => $call->callSid()->value(),
            'from_number' => $call->fromNumber()->value(),
            'to_number' => $call->toNumber()->value(),
            'status' => $call->status(),
            'duration_seconds' => $call->getDurationSeconds(),
            'current_step' => $call->currentStep(),
            'context' => $call->context(),
        ];

        if ($call->getError() !== null) {
            $data['error'] = $call->getError();
        }

        $data['recording_sid'] = $call->getRecordingSid();
        $data['recording_url'] = $call->getRecordingUrl();
        $data['recording_path'] = $call->getRecordingPath();
        $data['notes'] = $call->notes();

        if ($call->getStartedAt() !== null) {
            $data['started_at'] = $call->getStartedAt();
        }

        if ($call->getEndedAt() !== null) {
            $data['ended_at'] = $call->getEndedAt();
        }

        CallModel::updateOrCreate(
            ['id' => $call->id()],
            $data,
        );
    }

    public function getTranscript(string $id): ?string
    {
        $model = CallModel::find($id);

        return $model?->context['transcript'] ?? null;
    }

    public function countByTenant(string $tenantId): int
    {
        return CallModel::where('tenant_id', $tenantId)->count();
    }

    public function countTodayByTenant(string $tenantId): int
    {
        return CallModel::where('tenant_id', $tenantId)
            ->whereDate('started_at', today())
            ->count();
    }

    public function countActiveByTenant(string $tenantId): int
    {
        return CallModel::where('tenant_id', $tenantId)
            ->where('status', 'in_progress')
            ->count();
    }

    public function avgDurationByTenant(string $tenantId): int
    {
        return (int) CallModel::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->avg('duration_seconds');
    }

    public function callsByDay(string $tenantId, ?string $start = null, ?string $end = null): array
    {
        return CallModel::where('tenant_id', $tenantId)
            ->when($start, fn ($q) => $q->where('created_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('created_at', '<=', $end))
            ->when(! $start && ! $end, fn ($q) => $q->where('created_at', '>=', now()->subDays(7)))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    public function callsByStatus(string $tenantId, ?string $start = null, ?string $end = null): array
    {
        return CallModel::where('tenant_id', $tenantId)
            ->when($start, fn ($q) => $q->where('created_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('created_at', '<=', $end))
            ->when(! $start && ! $end, fn ($q) => $q->where('created_at', '>=', now()->subDays(7)))
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();
    }

    public function avgDurationByDay(string $tenantId, ?string $start = null, ?string $end = null): array
    {
        return CallModel::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->when($start, fn ($q) => $q->where('created_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('created_at', '<=', $end))
            ->when(! $start && ! $end, fn ($q) => $q->where('created_at', '>=', now()->subDays(7)))
            ->selectRaw('DATE(created_at) as date, AVG(duration_seconds) as avg_seconds')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    public function callsByFlow(string $tenantId, int $limit = 5, ?string $start = null, ?string $end = null): array
    {
        return CallModel::where('calls.tenant_id', $tenantId)
            ->join('flows', 'calls.flow_id', '=', 'flows.id')
            ->when($start, fn ($q) => $q->where('calls.created_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('calls.created_at', '<=', $end))
            ->when(! $start && ! $end, fn ($q) => $q->where('calls.created_at', '>=', now()->subDays(7)))
            ->selectRaw('flows.name as flow_name, COUNT(*) as count')
            ->groupBy('flows.name')
            ->orderBy('count', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function callsByFlowWithMetrics(string $tenantId, ?string $start = null, ?string $end = null): array
    {
        return CallModel::where('calls.tenant_id', $tenantId)
            ->join('flows', 'calls.flow_id', '=', 'flows.id')
            ->when($start, fn ($q) => $q->where('calls.created_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('calls.created_at', '<=', $end))
            ->when(! $start && ! $end, fn ($q) => $q->where('calls.created_at', '>=', now()->subDays(7)))
            ->selectRaw("
                flows.name as flow_name,
                COUNT(*) as total_calls,
                COALESCE(AVG(duration_seconds), 0) as avg_duration,
                SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
            ")
            ->groupBy('flows.name')
            ->orderBy('total_calls', 'desc')
            ->get()
            ->toArray();
    }

    public function countInRange(string $tenantId, ?string $start = null, ?string $end = null): int
    {
        return CallModel::where('tenant_id', $tenantId)
            ->when($start, fn ($q) => $q->where('created_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('created_at', '<=', $end))
            ->when(! $start && ! $end, fn ($q) => $q->where('created_at', '>=', now()->subDays(7)))
            ->count();
    }

    public function avgDurationInRange(string $tenantId, ?string $start = null, ?string $end = null): int
    {
        return (int) CallModel::where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->when($start, fn ($q) => $q->where('created_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('created_at', '<=', $end))
            ->when(! $start && ! $end, fn ($q) => $q->where('created_at', '>=', now()->subDays(7)))
            ->avg('duration_seconds');
    }

    private function toEntity(CallModel $model): Call
    {
        return new Call(
            id: $model->id,
            tenantId: $model->tenant_id,
            flowId: $model->flow_id,
            callSid: new CallSid($model->call_sid),
            fromNumber: new PhoneNumber($model->from_number),
            toNumber: new PhoneNumber($model->to_number),
            status: $model->status,
            durationSeconds: $model->duration_seconds ?? 0,
            currentStep: $model->current_step,
            context: $model->context ?? [],
            error: $model->error,
            startedAt: $model->started_at?->toDateTimeImmutable(),
            endedAt: $model->ended_at?->toDateTimeImmutable(),
            recordingSid: $model->recording_sid,
            recordingUrl: $model->recording_url,
            recordingPath: $model->recording_path,
            notes: $model->notes,
        );
    }
}
