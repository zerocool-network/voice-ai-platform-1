<?php

namespace App\Http\Requests;

use App\Application\Flow\Services\FlowSpeechLocale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FlowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('language')) {
            $this->merge([
                'language' => FlowSpeechLocale::fromAppLocale(app()->getLocale()),
            ]);
        } else {
            $this->merge([
                'language' => FlowSpeechLocale::bcp47($this->input('language')),
            ]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'language' => ['required', 'string', 'max:10', Rule::in(FlowSpeechLocale::allowed())],
            'is_active' => ['boolean'],
            'config' => ['nullable', 'json'],
            'template_id' => ['nullable', 'string', 'max:50'],
            'change_description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
