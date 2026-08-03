<?php

namespace App\Services\Integrations\HubSpot;

use App\Enums\HubSpotObjectType;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;

class HubSpotCrmService
{
    public function __construct(
        private readonly HubSpotApiClient $api,
    ) {}

    /**
     * @param  list<string>|null  $properties
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function list(
        TenantModel $tenant,
        HubSpotObjectType $type,
        ?string $after = null,
        int $limit = 25,
        ?array $properties = null,
        ?string $archived = null,
    ): array {
        $query = [
            'limit' => max(1, min($limit, 100)),
            'properties' => implode(',', $properties ?? $type->defaultProperties()),
        ];
        if ($after) {
            $query['after'] = $after;
        }
        if ($archived !== null) {
            $query['archived'] = $archived;
        }

        return $this->api->get($tenant, '/crm/v3/objects/'.$type->apiPath(), $query);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @param  list<string>|null  $properties
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function search(
        TenantModel $tenant,
        HubSpotObjectType $type,
        string $query = '',
        array $filters = [],
        int $limit = 25,
        ?string $after = null,
        ?array $properties = null,
    ): array {
        $body = [
            'limit' => max(1, min($limit, 100)),
            'properties' => $properties ?? $type->defaultProperties(),
        ];
        if ($query !== '') {
            $body['query'] = $query;
        }
        if ($filters !== []) {
            $body['filterGroups'] = $filters;
        }
        if ($after) {
            $body['after'] = $after;
        }

        return $this->api->post($tenant, '/crm/v3/objects/'.$type->apiPath().'/search', $body);
    }

    /**
     * @param  list<string>|null  $properties
     * @param  list<string>|null  $associations
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function get(
        TenantModel $tenant,
        HubSpotObjectType $type,
        string $id,
        ?array $properties = null,
        ?array $associations = null,
    ): array {
        $query = [
            'properties' => implode(',', $properties ?? $type->defaultProperties()),
        ];
        if ($associations) {
            $query['associations'] = implode(',', $associations);
        }

        return $this->api->get($tenant, '/crm/v3/objects/'.$type->apiPath().'/'.$id, $query);
    }

    /**
     * @param  array<string, mixed>  $properties
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function create(TenantModel $tenant, HubSpotObjectType $type, array $properties): array
    {
        return $this->api->post($tenant, '/crm/v3/objects/'.$type->apiPath(), [
            'properties' => $properties,
        ]);
    }

    /**
     * @param  array<string, mixed>  $properties
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function update(TenantModel $tenant, HubSpotObjectType $type, string $id, array $properties): array
    {
        return $this->api->patch($tenant, '/crm/v3/objects/'.$type->apiPath().'/'.$id, [
            'properties' => $properties,
        ]);
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function archive(TenantModel $tenant, HubSpotObjectType $type, string $id): array
    {
        return $this->api->delete($tenant, '/crm/v3/objects/'.$type->apiPath().'/'.$id);
    }

    /**
     * @param  list<string>  $ids
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function batchArchive(TenantModel $tenant, HubSpotObjectType $type, array $ids): array
    {
        return $this->api->post($tenant, '/crm/v3/objects/'.$type->apiPath().'/batch/archive', [
            'inputs' => array_map(fn (string $id) => ['id' => $id], $ids),
        ]);
    }

    /**
     * @param  list<array{id: string, properties: array<string, mixed>}>  $inputs
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function batchUpdate(TenantModel $tenant, HubSpotObjectType $type, array $inputs): array
    {
        return $this->api->post($tenant, '/crm/v3/objects/'.$type->apiPath().'/batch/update', [
            'inputs' => $inputs,
        ]);
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function listAssociations(
        TenantModel $tenant,
        HubSpotObjectType $from,
        string $id,
        string $toObjectType,
    ): array {
        return $this->api->get(
            $tenant,
            '/crm/v4/objects/'.$from->apiPath().'/'.$id.'/associations/'.$toObjectType
        );
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function createAssociation(
        TenantModel $tenant,
        HubSpotObjectType $from,
        string $fromId,
        string $toObjectType,
        string $toId,
        int $associationTypeId = 1,
    ): array {
        return $this->api->put(
            $tenant,
            '/crm/v4/objects/'.$from->apiPath().'/'.$fromId.'/associations/'.$toObjectType.'/'.$toId,
            [
                [
                    'associationCategory' => 'HUBSPOT_DEFINED',
                    'associationTypeId' => $associationTypeId,
                ],
            ]
        );
    }

    /**
     * @return array{ok: bool, status: int, data: mixed, error: ?string, missing_scope: bool, rate_limited: bool}
     */
    public function deleteAssociation(
        TenantModel $tenant,
        HubSpotObjectType $from,
        string $fromId,
        string $toObjectType,
        string $toId,
    ): array {
        return $this->api->delete(
            $tenant,
            '/crm/v4/objects/'.$from->apiPath().'/'.$fromId.'/associations/'.$toObjectType.'/'.$toId
        );
    }
}
