<?php

namespace App\Services\Integrations\HubSpot;

use App\Enums\IntegrationProvider;
use App\Enums\IntegrationStatus;
use App\Infrastructure\Persistence\Eloquent\Call\CallModel;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Services\Integrations\IntegrationConnectionService;
use HubSpot\Client\Crm\Contacts\Model\Filter as ContactFilter;
use HubSpot\Client\Crm\Contacts\Model\FilterGroup as ContactFilterGroup;
use HubSpot\Client\Crm\Contacts\Model\PublicObjectSearchRequest as ContactSearchRequest;
use HubSpot\Client\Crm\Contacts\Model\SimplePublicObjectInputForCreate as ContactCreateInput;
use HubSpot\Client\Crm\Objects\Notes\Model\AssociationSpec as NoteAssociationSpec;
use HubSpot\Client\Crm\Objects\Notes\Model\PublicAssociationsForObject as NoteAssociations;
use HubSpot\Client\Crm\Objects\Notes\Model\SimplePublicObjectInputForCreate as NoteCreateInput;
use HubSpot\Client\Crm\Tickets\Model\AssociationSpec as TicketAssociationSpec;
use HubSpot\Client\Crm\Tickets\Model\PublicAssociationsForObject as TicketAssociations;
use HubSpot\Client\Crm\Tickets\Model\SimplePublicObjectInputForCreate as TicketCreateInput;
use Illuminate\Support\Facades\Log;

class HubSpotSyncService
{
    public function __construct(
        private readonly HubSpotOAuthService $oauth,
        private readonly IntegrationConnectionService $connections,
    ) {}

    /** @return array{ok: bool, contact_id: ?string, error: ?string} */
    public function syncCall(TenantModel $tenant, CallModel $call): array
    {
        if ($this->connections->status($tenant, IntegrationProvider::HubSpot) !== IntegrationStatus::Connected) {
            return ['ok' => false, 'contact_id' => null, 'error' => 'HubSpot not connected'];
        }

        $config = $this->connections->get($tenant, IntegrationProvider::HubSpot);
        $sync = is_array($config['sync'] ?? null) ? $config['sync'] : [];

        try {
            $hubspot = $this->oauth->clientFor($tenant);
            $phone = $this->normalizePhone($call->from_number);
            $contactId = $this->findContactIdByPhone($hubspot, $phone);

            if ($contactId === null && ($sync['create_contact'] ?? true)) {
                $contactId = $this->createContact($hubspot, $phone, $call);
            }

            if ($contactId !== null && ($sync['log_call_engagement'] ?? true)) {
                $this->logCallEngagement($hubspot, $contactId, $call);
            }

            $context = $call->context ?? [];
            $transferred = ($context['transferred'] ?? false) || ($call->status === 'transferred');
            if ($contactId !== null && $transferred && ($sync['create_ticket_on_transfer'] ?? false)) {
                $this->createTicket($hubspot, $contactId, $call);
            }

            $this->connections->put($tenant, IntegrationProvider::HubSpot, [
                'last_sync_at' => now()->toIso8601String(),
                'last_error' => null,
            ]);

            return ['ok' => true, 'contact_id' => $contactId, 'error' => null];
        } catch (\Throwable $e) {
            Log::warning('HubSpot sync failed', [
                'tenant_id' => $tenant->id,
                'call_id' => $call->id,
                'message' => $e->getMessage(),
            ]);

            $this->connections->put($tenant, IntegrationProvider::HubSpot, [
                'last_error' => 'Sync failed',
            ]);

            activity()
                ->event('hubspot_sync_failed')
                ->performedOn($tenant)
                ->withProperties(['call_id' => $call->id])
                ->log('HubSpot sync failed');

            return ['ok' => false, 'contact_id' => null, 'error' => 'Sync failed'];
        }
    }

    private function findContactIdByPhone(mixed $hubspot, string $phone): ?string
    {
        $filter = new ContactFilter([
            'property_name' => 'phone',
            'operator' => 'EQ',
            'value' => $phone,
        ]);
        $group = new ContactFilterGroup(['filters' => [$filter]]);
        $search = new ContactSearchRequest([
            'filter_groups' => [$group],
            'limit' => 1,
        ]);

        $response = $hubspot->crm()->contacts()->searchApi()->doSearch($search);
        $results = $response->getResults() ?? [];
        if ($results === []) {
            return null;
        }

        return $results[0]->getId();
    }

    private function createContact(mixed $hubspot, string $phone, CallModel $call): ?string
    {
        $properties = [
            'phone' => $phone,
            'lastname' => 'Voice AI Caller',
            'hs_lead_status' => 'NEW',
        ];

        $input = new ContactCreateInput(['properties' => $properties]);
        $response = $hubspot->crm()->contacts()->basicApi()->create($input);

        return $response->getId();
    }

    private function logCallEngagement(mixed $hubspot, string $contactId, CallModel $call): void
    {
        $body = sprintf(
            "Voice AI call\nSID: %s\nStatus: %s\nDuration: %ss\nFrom: %s\nTo: %s",
            $call->call_sid,
            $call->status,
            $call->duration_seconds,
            $call->from_number,
            $call->to_number,
        );

        $association = new NoteAssociations([
            'to' => ['id' => $contactId],
            'types' => [
                new NoteAssociationSpec([
                    'association_category' => 'HUBSPOT_DEFINED',
                    'association_type_id' => 202,
                ]),
            ],
        ]);

        $input = new NoteCreateInput([
            'properties' => [
                'hs_timestamp' => (string) now()->getTimestampMs(),
                'hs_note_body' => $body,
            ],
            'associations' => [$association],
        ]);

        $hubspot->crm()->objects()->notes()->basicApi()->create($input);
    }

    private function createTicket(mixed $hubspot, string $contactId, CallModel $call): void
    {
        $association = new TicketAssociations([
            'to' => ['id' => $contactId],
            'types' => [
                new TicketAssociationSpec([
                    'association_category' => 'HUBSPOT_DEFINED',
                    'association_type_id' => 16,
                ]),
            ],
        ]);

        $input = new TicketCreateInput([
            'properties' => [
                'subject' => 'Transferred voice call '.$call->call_sid,
                'hs_pipeline' => '0',
                'hs_pipeline_stage' => '1',
                'content' => 'Caller '.$call->from_number.' transferred from Voice AI flow.',
            ],
            'associations' => [$association],
        ]);

        $hubspot->crm()->tickets()->basicApi()->create($input);
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if ($digits === '') {
            return $phone;
        }

        return str_starts_with($phone, '+') ? '+'.$digits : '+'.$digits;
    }
}
