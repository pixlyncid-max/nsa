<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePartnershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'institution' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'partnership_scheme' => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:2000'],
            'fax_number' => ['nullable', 'max:0'], // Honeypot anti-spam (harus kosong)
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama narahubung wajib diisi.',
            'institution.required' => 'Nama instansi atau perusahaan wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'phone.required' => 'Nomor telepon/WhatsApp wajib diisi.',
            'partnership_scheme.required' => 'Pilih skema kemitraan yang diajukan.',
            'message.required' => 'Rincian pesan atau proposal kemitraan wajib diisi.',
            'fax_number.max' => 'Spam terdeteksi.',
        ];
    }
}
