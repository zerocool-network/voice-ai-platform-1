<?php

namespace App\Infrastructure\Persistence\Eloquent\Flow;

use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Domain\Flow\ValueObjects\FlowConfig;

class EloquentFlowRepository implements FlowRepositoryInterface
{
    public function findById(string $id): ?Flow
    {
        $model = FlowModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function findByPhoneNumber(string $phoneNumber): ?Flow
    {
        $model = FlowModel::where('phone_number', $phoneNumber)
            ->where('is_active', true)
            ->first();

        return $model ? $this->toEntity($model) : null;
    }

    /** @return Flow[] */
    public function findByTenant(string $tenantId): array
    {
        return FlowModel::where('tenant_id', $tenantId)
            ->get()
            ->map(fn (FlowModel $model) => $this->toEntity($model))
            ->all();
    }

    public function save(Flow $flow): void
    {
        FlowModel::updateOrCreate(
            ['id' => $flow->id()],
            [
                'tenant_id' => $flow->tenantId(),
                'name' => $flow->name(),
                'description' => $flow->description(),
                'phone_number' => $flow->phoneNumber(),
                'language' => $flow->language(),
                'config' => $flow->config()->toArray(),
                'is_active' => $flow->isActive(),
                'version' => $flow->version(),
            ],
        );
    }

    public function delete(string $id): void
    {
        FlowModel::where('id', $id)->delete();
    }

    public function countByTenant(string $tenantId): int
    {
        return FlowModel::where('tenant_id', $tenantId)->count();
    }

    public function countActiveByTenant(string $tenantId): int
    {
        return FlowModel::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->count();
    }

    private function toEntity(FlowModel $model): Flow
    {
        return new Flow(
            id: $model->id,
            tenantId: $model->tenant_id,
            name: $model->name,
            description: $model->description,
            phoneNumber: $model->phone_number,
            config: FlowConfig::fromArray((array) $model->config),
            isActive: $model->is_active,
            version: $model->version,
            language: $model->language ?: 'en-US',
        );
    }
}
