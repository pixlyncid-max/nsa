<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SaveNetworkProfileStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'marketing_info' => ['nullable', 'string', 'max:2000'],
            'distribution_areas' => ['nullable', 'array'],
            'distribution_areas.*' => ['nullable', 'string', 'max:100'],
            'supply_needs' => ['nullable', 'string', 'max:2000'],
            'cooperation_types' => ['nullable', 'array'],
            'cooperation_types.*' => ['nullable', 'string', 'max:100'],
            'cooperation_types_custom' => ['nullable', 'string', 'max:255'],
            'professional_activities' => ['nullable', 'string', 'max:2000'],
            'is_skipped' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'marketing_info.max' => 'Informasi pemasaran maksimal 2000 karakter.',
            'supply_needs.max' => 'Kebutuhan pasokan maksimal 2000 karakter.',
            'professional_activities.max' => 'Kegiatan profesional maksimal 2000 karakter.',
        ];
    }
}
