<?php

namespace App\Http\Resources;

use App\Domain\Flow\Entities\Flow;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Flow */
class FlowResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getId(),
            'tenant_id' => $this->getTenantId(),
            'name' => $this->getName(),
            'description' => $this->getDescription(),
            'phone_number' => $this->getPhoneNumber(),
            'language' => $this->getLanguage(),
            'config' => $this->getConfig(),
            'is_active' => $this->isActive(),
            'version' => $this->getVersion(),
            'created_at' => $this->created_at ?? null,
            'updated_at' => $this->updated_at ?? null,
        ];
    }
}
