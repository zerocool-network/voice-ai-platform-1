<?php

namespace App\Http\Requests\Integrations\HubSpot;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BatchHubSpotObjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageHubSpot') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(['archive', 'update'])],
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['required', 'string'],
            'properties' => ['required_if:action,update', 'array'],
        ];
    }
}
