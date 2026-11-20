<?php

namespace App\Http\Requests\Membership;

use App\Models\MemberDocument;
use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
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
        $configs = config('member_documents', []);
        $type = $this->input('type');
        $typeConfig = $configs[$type] ?? null;

        $maxSizeKb = $typeConfig['max_size_kb'] ?? 5120;
        $allowedMimes = ! empty($typeConfig['allowed_mimes'])
            ? implode(',', $typeConfig['allowed_mimes'])
            : 'image/jpeg,image/png,application/pdf';

        $allowedTypes = array_keys($configs);

        return [
            'type' => ['required', 'string', 'max:50'],
            'file' => [
                'required',
                'file',
                'mimetypes:'.$allowedMimes,
                'max:'.$maxSizeKb,
            ],
        ];
    }

    /**
     * Validasi tambahan setelah aturan dasar.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('type');
            $configs = config('member_documents', []);
            $typeConfig = $configs[$type] ?? null;

            if ($typeConfig && ! empty($typeConfig['multiple']) && ! empty($typeConfig['max_files'])) {
                $currentCount = MemberDocument::where('user_id', $this->user()->id)
                    ->where('type', $type)
                    ->count();

                if ($currentCount >= $typeConfig['max_files']) {
                    $validator->errors()->add(
                        'file',
                        "Jumlah maksimal {$typeConfig['max_files']} berkas untuk {$typeConfig['title']} telah tercapai."
                    );
                }
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $type = $this->input('type');
        $configs = config('member_documents', []);
        $typeConfig = $configs[$type] ?? null;
        $maxMb = $typeConfig ? round($typeConfig['max_size_kb'] / 1024) : 5;

        return [
            'type.required' => 'Jenis dokumen wajib dipilih.',
            'type.in' => 'Jenis dokumen yang dipilih tidak valid.',
            'file.required' => 'Berkas dokumen wajib diunggah.',
            'file.file' => 'Berkas yang diunggah tidak valid.',
            'file.mimetypes' => $type === 'business_photo'
                ? 'Foto usaha harus berupa berkas gambar JPG atau PNG.'
                : 'Format berkas tidak sesuai. Harap unggah format JPG, PNG, atau PDF yang valid.',
            'file.max' => "Ukuran berkas tidak boleh melebihi {$maxMb} MB.",
        ];
    }
}
