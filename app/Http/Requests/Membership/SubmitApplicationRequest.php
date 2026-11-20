<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SubmitApplicationRequest extends FormRequest
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
        return [
            'agree_terms' => ['required', 'accepted'],
            'agree_privacy' => ['required', 'accepted'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'agree_terms.required' => 'Anda wajib menyetujui ketentuan dan AD/ART keanggotaan.',
            'agree_terms.accepted' => 'Anda wajib mencentang persetujuan ketentuan keanggotaan sebelum mengirim pengajuan.',
            'agree_privacy.required' => 'Anda wajib menyetujui kebijakan privasi.',
            'agree_privacy.accepted' => 'Anda wajib mencentang persetujuan kebijakan privasi sebelum mengirim pengajuan.',
        ];
    }
}
