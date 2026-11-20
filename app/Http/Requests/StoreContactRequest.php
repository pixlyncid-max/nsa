<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
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
            'email' => ['required', 'email', 'max:150'],
            'topic' => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:3000'],
            'fax_number' => ['nullable', 'max:0'], // Honeypot anti-spam
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'topic.required' => 'Pilih topik permohonan atau pertanyaan Anda.',
            'message.required' => 'Pesan atau pertanyaan wajib diisi.',
            'fax_number.max' => 'Spam terdeteksi.',
        ];
    }
}
