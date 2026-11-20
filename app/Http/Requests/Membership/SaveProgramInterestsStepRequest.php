<?php

namespace App\Http\Requests\Membership;

use App\Enums\ProgramCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SaveProgramInterestsStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'interests' => ['nullable', 'array'],
            'interests.*' => ['required', 'string', new Enum(ProgramCategory::class)],
            'note' => ['nullable', 'string', 'max:1000'],
            'is_skipped' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'interests.array' => 'Data minat program harus berupa daftar pilihan.',
            'interests.*.enum' => 'Kategori minat program yang dipilih tidak valid.',
            'note.max' => 'Catatan tambahan maksimal 1000 karakter.',
        ];
    }
}
