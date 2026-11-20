<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SaveCategoryStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $category = $this->input('membership_category');

        return [
            'membership_category' => ['required', 'string', 'max:100'],
            'membership_category_custom' => [
                $category === 'Lainnya' ? 'required' : 'nullable',
                'string',
                'max:150',
            ],
            'applicant_type' => ['required', 'in:individual,institution'],
            'institution_name' => [
                'required_if:applicant_type,institution',
                'nullable',
                'string',
                'max:255',
            ],
            'applicant_position' => [
                'required_if:applicant_type,institution',
                'nullable',
                'string',
                'max:150',
            ],
            'membership_type_id' => ['required', 'integer', 'exists:membership_types,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'membership_category.required' => 'Pilih kategori kegiatan keanggotaan Anda.',
            'membership_category_custom.required' => 'Sebutkan rincian kategori kegiatan lainnya.',
            'applicant_type.required' => 'Pilih status pendaftar (Individu atau Perwakilan Lembaga).',
            'applicant_type.in' => 'Status pendaftar harus berupa Individu atau Perwakilan Lembaga.',
            'institution_name.required_if' => 'Nama lembaga / badan usaha wajib diisi untuk pendaftar perwakilan lembaga.',
            'applicant_position.required_if' => 'Jabatan pendaftar di lembaga wajib diisi.',
            'membership_type_id.required' => 'Pilih jenis keanggotaan NSA.',
            'membership_type_id.exists' => 'Jenis keanggotaan yang dipilih tidak valid.',
        ];
    }
}
