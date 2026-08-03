<?php

namespace App\Http\Requests\Integrations\HubSpot;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHubSpotSyncRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageHubSpot') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'create_contact' => ['required', 'boolean'],
            'log_call_engagement' => ['required', 'boolean'],
            'create_ticket_on_transfer' => ['required', 'boolean'],
            'create_company' => ['sometimes', 'boolean'],
            'create_lead' => ['sometimes', 'boolean'],
            'create_deal' => ['sometimes', 'boolean'],
            'log_task' => ['sometimes', 'boolean'],
            'send_timeline_event' => ['sometimes', 'boolean'],
            'send_app_event' => ['sometimes', 'boolean'],
            'property_map' => ['sometimes', 'array'],
            'property_map.*' => ['nullable', 'string', 'max:191'],
            'target_objects' => ['sometimes', 'array'],
            'target_objects.*' => ['string', Rule::in([
                'contacts', 'companies', 'leads', 'deals', 'tickets', 'calls', 'notes', 'tasks',
            ])],
        ];
    }
}
