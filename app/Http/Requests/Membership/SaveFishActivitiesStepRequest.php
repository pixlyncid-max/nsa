<?php

namespace App\Http\Requests\Membership;

use App\Support\ActivityFormRules;
use Illuminate\Foundation\Http\FormRequest;

class SaveFishActivitiesStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $application = $this->user()?->application;
        $category = $application?->membership_category ?? $this->input('membership_category');

        // Jika user memilih melewati langkah (skip) atau kategori tidak wajib
        if ($this->boolean('is_skipped') || ActivityFormRules::isSkippable($category)) {
            return [
                'activities' => ['nullable', 'array'],
                'is_skipped' => ['nullable', 'boolean'],
            ];
        }

        return ActivityFormRules::buildRules($category);
    }

    public function messages(): array
    {
        $application = $this->user()?->application;
        $category = $application?->membership_category ?? $this->input('membership_category');

        return ActivityFormRules::buildMessages($category);
    }
}
