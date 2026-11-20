<?php

namespace App\Http\Requests\Membership;

use App\Models\MemberDocument;
use Illuminate\Foundation\Http\FormRequest;

class SaveDocumentsStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }

    /**
     * Validasi kelengkapan dokumen wajib sebelum lanjut ke langkah berikutnya.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $userId = $this->user()->id;

            $hasKtp = MemberDocument::where('user_id', $userId)->where('type', 'ktp')->exists();
            if (! $hasKtp) {
                $validator->errors()->add('ktp', 'Dokumen KTP wajib diunggah.');
            }

            $hasNib = MemberDocument::where('user_id', $userId)->where('type', 'nib')->exists();
            if (! $hasNib) {
                $validator->errors()->add('nib', 'Dokumen NIB wajib diunggah.');
            }

            $businessPhotoCount = MemberDocument::where('user_id', $userId)->where('type', 'business_photo')->count();
            if ($businessPhotoCount < 1) {
                $validator->errors()->add('business_photo', 'Foto tempat atau kegiatan usaha wajib diunggah minimal 1 foto.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ktp.required' => 'Dokumen KTP wajib diunggah.',
            'nib.required' => 'Dokumen NIB wajib diunggah.',
            'business_photo.required' => 'Foto tempat atau kegiatan usaha wajib diunggah minimal 1 foto.',
        ];
    }
}
