<?php

namespace App\Http\Requests\Integrations\HubSpot;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHubSpotObjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageHubSpot') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'properties' => ['required', 'array', 'min:1'],
            'properties.*' => ['nullable'],
        ];
    }
}
