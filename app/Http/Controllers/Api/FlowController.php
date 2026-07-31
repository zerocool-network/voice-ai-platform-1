<?php

namespace App\Http\Controllers\Api;

use App\Application\Flow\Services\FlowSpeechLocale;
use App\Domain\Flow\Entities\Flow;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Domain\Flow\ValueObjects\FlowConfig;
use App\Http\Controllers\Controller;
use App\Http\Resources\FlowResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FlowController extends Controller
{
    public function __construct(
        private readonly FlowRepositoryInterface $flowRepository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $flows = $this->flowRepository->findByTenant($tenantId);

        return response()->json(FlowResource::collection($flows));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'language' => ['nullable', 'string', 'max:10', Rule::in(FlowSpeechLocale::allowed())],
            'config' => 'required|array',
            'config.start_step' => 'required|string',
            'config.steps' => 'required|array',
        ]);

        $flow = new Flow(
            id: (string) Str::uuid(),
            tenantId: $request->user()->tenant_id,
            name: $data['name'],
            description: $data['description'] ?? null,
            phoneNumber: $data['phone_number'] ?? null,
            config: FlowConfig::fromArray($data['config']),
            isActive: true,
            version: 1,
            language: FlowSpeechLocale::bcp47($data['language'] ?? null),
        );

        $this->flowRepository->save($flow);

        return response()->json(new FlowResource($flow), 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $flow = $this->flowRepository->findById($id);

        if (! $flow || $flow->getTenantId() !== $request->user()->tenant_id) {
            return response()->json(['error' => 'Flow not found'], 404);
        }

        return response()->json(new FlowResource($flow));
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $flow = $this->flowRepository->findById($id);

        if (! $flow || $flow->getTenantId() !== $request->user()->tenant_id) {
            return response()->json(['error' => 'Flow not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'language' => ['sometimes', 'string', 'max:10', Rule::in(FlowSpeechLocale::allowed())],
            'config' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $updated = new Flow(
            id: $flow->getId(),
            tenantId: $flow->getTenantId(),
            name: $data['name'] ?? $flow->getName(),
            description: $data['description'] ?? $flow->getDescription(),
            phoneNumber: $data['phone_number'] ?? $flow->getPhoneNumber(),
            config: isset($data['config'])
                ? FlowConfig::fromArray($data['config'])
                : $flow->config(),
            isActive: $data['is_active'] ?? $flow->isActive(),
            version: $flow->getVersion(),
            language: FlowSpeechLocale::bcp47($data['language'] ?? $flow->language()),
        );

        $this->flowRepository->save($updated);

        return response()->json(new FlowResource($updated));
    }
}
