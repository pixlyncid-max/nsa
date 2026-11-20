<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SaveBusinessProfileStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $hasNoBusiness = filter_var($this->input('has_no_business'), FILTER_VALIDATE_BOOLEAN);

        $rules = [
            'has_no_business' => ['boolean'],
            'operational_info' => ['nullable', 'string', 'max:500'],
            'legal_documents' => ['nullable', 'array'],
            'legal_documents.*.type' => ['required', 'in:nib,npwp,cbib,other'],
            'legal_documents.*.number' => ['required', 'string', 'max:100'],
            'legal_documents.*.label' => ['nullable', 'string', 'max:100'],
            'legal_documents.*.issued_at' => ['nullable', 'date'],
            'legal_documents.*.expires_at' => ['nullable', 'date'],
        ];

        if ($hasNoBusiness) {
            $rules['main_job'] = ['required', 'string', 'max:255'];
            $rules['name'] = ['nullable', 'string', 'max:255'];
            $rules['activity_field'] = ['nullable', 'string', 'max:150'];
            $rules['years_operating'] = ['nullable', 'numeric', 'min:0'];
            $rules['scale'] = ['nullable', 'in:Mikro,Kecil,Menengah,Besar'];
        } else {
            $rules['name'] = ['required', 'string', 'max:255'];
            $rules['activity_field'] = ['required', 'string', 'max:150'];
            $rules['years_operating'] = ['required', 'numeric', 'min:0'];
            $rules['scale'] = ['required', 'in:Mikro,Kecil,Menengah,Besar'];
            $rules['main_job'] = ['nullable', 'string', 'max:255'];
        }

        return $rules;
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $application = $user?->application;
            $category = $application?->membership_category ?? $this->input('membership_category');

            // Cek apakah kategori ini mewajibkan dokumen legalitas tertentu (mis. Eksportir wajib NIB)
            $requiredLegalities = config('membership.required_legalities', [
                'Eksportir' => ['nib'],
                'Pengolah' => ['nib'],
            ]);

            if ($category && isset($requiredLegalities[$category])) {
                $requiredTypes = $requiredLegalities[$category];
                $submittedDocuments = $this->input('legal_documents', []);
                $submittedTypes = collect($submittedDocuments)->pluck('type')->toArray();

                foreach ($requiredTypes as $requiredType) {
                    if (! in_array($requiredType, $submittedTypes, true)) {
                        $typeName = strtoupper($requiredType);
                        $validator->errors()->add(
                            'legal_documents',
                            "Kategori kegiatan '{$category}' mewajibkan pengisian dokumen perizinan {$typeName}."
                        );
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama usaha atau lembaga wajib diisi.',
            'activity_field.required' => 'Bidang kegiatan usaha wajib diisi.',
            'years_operating.required' => 'Lama berusaha wajib diisi.',
            'scale.required' => 'Pilih skala kegiatan usaha Anda.',
            'scale.in' => 'Skala usaha harus bernilai Mikro, Kecil, Menengah, atau Besar.',
            'main_job.required' => 'Pekerjaan utama wajib diisi jika belum memiliki usaha.',
            'operational_info.max' => 'Informasi operasional maksimal 500 karakter.',
            'legal_documents.*.type.required' => 'Pilih jenis dokumen perizinan.',
            'legal_documents.*.number.required' => 'Nomor izin atau nomor pokok perizinan wajib diisi.',
        ];
    }
}
