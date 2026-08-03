<?php

namespace App\Services\Integrations\Analytics;

use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Support\Collection;

class AnalyticsExportService
{
    /**
     * Stable Looker Studio / BigQuery fact schema.
     *
     * @return list<array{name: string, type: string}>
     */
    public function schema(): array
    {
        return [
            ['name' => 'call_id', 'type' => 'STRING'],
            ['name' => 'tenant_id', 'type' => 'STRING'],
            ['name' => 'flow_id', 'type' => 'STRING'],
            ['name' => 'from', 'type' => 'STRING'],
            ['name' => 'to', 'type' => 'STRING'],
            ['name' => 'status', 'type' => 'STRING'],
            ['name' => 'language', 'type' => 'STRING'],
            ['name' => 'duration_seconds', 'type' => 'NUMBER'],
            ['name' => 'started_at', 'type' => 'YEARMONTHDAYHOURMINUTESECOND'],
            ['name' => 'ended_at', 'type' => 'YEARMONTHDAYHOURMINUTESECOND'],
            ['name' => 'outcome', 'type' => 'STRING'],
        ];
    }

    /**
     * @return array{schema: list<array{name: string, type: string}>, rows: list<array<string, mixed>>, next_cursor: ?string}
     */
    public function export(TenantModel $tenant, ?string $cursor = null, int $limit = 100): array
    {
        $limit = max(1, min(500, $limit));

        $query = CallModel::query()
            ->where('tenant_id', $tenant->id)
            ->orderBy('id');

        if ($cursor !== null && $cursor !== '') {
            $query->where('id', '>', $cursor);
        }

        /** @var Collection<int, CallModel> $calls */
        $calls = $query->limit($limit)->get();

        $rows = $calls->map(fn (CallModel $call) => $this->mapCall($call))->values()->all();
        $next = $calls->count() === $limit ? $calls->last()?->id : null;

        return [
            'schema' => $this->schema(),
            'rows' => $rows,
            'next_cursor' => $next,
        ];
    }

    /** @return array<string, mixed> */
    public function mapCall(CallModel $call): array
    {
        $context = $call->context ?? [];

        return [
            'call_id' => $call->id,
            'tenant_id' => $call->tenant_id,
            'flow_id' => $call->flow_id,
            'from' => $call->from_number,
            'to' => $call->to_number,
            'status' => $call->status,
            'language' => $context['language'] ?? null,
            'duration_seconds' => $call->duration_seconds,
            'started_at' => optional($call->started_at)?->toIso8601String(),
            'ended_at' => optional($call->ended_at)?->toIso8601String(),
            'outcome' => $context['outcome'] ?? $call->status,
        ];
    }

    /** @return array<string, mixed> */
    public function studioSummary(TenantModel $tenant, int $days = 30): array
    {
        $since = now()->subDays($days)->startOfDay();

        $calls = CallModel::query()
            ->where('tenant_id', $tenant->id)
            ->where('started_at', '>=', $since)
            ->get(['id', 'status', 'duration_seconds', 'started_at', 'context', 'flow_id']);

        $byStatus = $calls->groupBy('status')->map->count()->all();
        $byDay = $calls
            ->groupBy(fn (CallModel $c) => optional($c->started_at)?->toDateString() ?? 'unknown')
            ->map->count()
            ->all();

        $avgDuration = $calls->avg('duration_seconds');

        return [
            'total_calls' => $calls->count(),
            'avg_duration_seconds' => $avgDuration !== null ? round((float) $avgDuration, 1) : 0,
            'by_status' => $byStatus,
            'by_day' => $byDay,
            'days' => $days,
        ];
    }
}
