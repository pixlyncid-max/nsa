<?php

namespace App\Http\Requests\Membership;

use App\Support\Brand;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveStatementStepRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $hasExistingSignature = ! empty($this->user()?->memberApplication?->statement?->signature_path);

        return [
            'agree_data_accurate' => ['required', 'accepted'],
            'agree_ad_art' => ['required', 'accepted'],
            'agree_privacy_policy' => ['required', 'accepted'],
            'signature_data' => [
                $hasExistingSignature ? 'nullable' : 'required_without:signature_path',
                'nullable',
                'string',
            ],
            'signature_path' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Pesan kustom dalam Bahasa Indonesia ramah pengguna.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $short = Brand::shortName();

        return [
            'agree_data_accurate.accepted' => 'Anda wajib menyatakan bahwa data yang diisi adalah benar.',
            'agree_data_accurate.required' => 'Anda wajib mencentang pernyataan kebenaran data.',
            'agree_ad_art.accepted' => "Anda wajib menyetujui untuk mematuhi AD/ART {$short}.",
            'agree_ad_art.required' => "Anda wajib mencentang persetujuan AD/ART {$short}.",
            'agree_privacy_policy.accepted' => 'Anda wajib menyetujui pemrosesan data sesuai kebijakan privasi.',
            'agree_privacy_policy.required' => 'Anda wajib mencentang persetujuan kebijakan privasi.',
            'signature_data.required_without' => 'Mohon bubuhkan tanda tangan digital Anda pada kanvas yang disediakan.',
            'signature_data.required' => 'Mohon bubuhkan tanda tangan digital Anda pada kanvas yang disediakan.',
            'city.max' => 'Nama kota penandatanganan maksimal 100 karakter.',
        ];
    }
}
