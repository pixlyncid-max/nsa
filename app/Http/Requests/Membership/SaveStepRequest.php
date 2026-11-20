<?php

namespace App\Http\Requests\Membership;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveStepRequest extends FormRequest
{
    /**
     * Tentukan apakah pengguna diotorisasi untuk membuat permintaan ini.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Dapatkan aturan validasi sesuai nomor langkah.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $step = (int) $this->route('step', $this->input('step', 1));

        return match ($step) {
            1 => [
                'name' => ['required', 'string', 'max:150'],
                'phone' => ['required', 'string', 'max:30'],
                'password' => ['nullable', 'string', 'min:8'],
            ],
            2 => [
                'nik' => ['nullable', 'string', 'regex:/^\d{16}$/'],
                'name_ktp' => ['nullable', 'string', 'max:150'],
                'birth_place' => ['nullable', 'string', 'max:100'],
                'birth_date' => ['nullable', 'date'],
                'gender' => ['nullable', 'in:male,female,Laki-laki,Perempuan'],
                'occupation' => ['nullable', 'string', 'max:100'],
                'province_id' => ['nullable', 'exists:provinces,id'],
                'regency_id' => ['nullable', 'exists:regencies,id'],
                'district_id' => ['nullable', 'exists:districts,id'],
                'village_id' => ['nullable', 'exists:villages,id'],
                'postal_code' => ['nullable', 'string', 'max:10'],
                'address' => ['nullable', 'string', 'max:500'],
                'is_domicile_same' => ['nullable', 'boolean'],
                'domicile_province_id' => ['nullable', 'exists:provinces,id'],
                'domicile_regency_id' => ['nullable', 'exists:regencies,id'],
                'domicile_district_id' => ['nullable', 'exists:districts,id'],
                'domicile_village_id' => ['nullable', 'exists:villages,id'],
                'domicile_postal_code' => ['nullable', 'string', 'max:10'],
                'domicile_address' => ['nullable', 'string', 'max:500'],
            ],
            3 => [
                'membership_type' => ['nullable', 'string', 'max:100'],
                'business_name' => ['nullable', 'string', 'max:150'],
                'owner_name' => ['nullable', 'string', 'max:150'],
                'nib' => ['nullable', 'string', 'regex:/^\d{13}$/'],
                'npwp' => ['nullable', 'string', 'max:30'],
                'founded_at' => ['nullable', 'date'],
                'employee_count' => ['nullable', 'integer', 'min:0'],
                'annual_revenue' => ['nullable', 'string', 'max:100'],
                'business_status' => ['nullable', 'string', 'max:100'],
                'business_scale' => ['nullable', 'string', 'max:100'],
                'province_id' => ['nullable', 'exists:provinces,id'],
                'regency_id' => ['nullable', 'exists:regencies,id'],
                'district_id' => ['nullable', 'exists:districts,id'],
                'village_id' => ['nullable', 'exists:villages,id'],
                'postal_code' => ['nullable', 'string', 'max:10'],
                'business_address' => ['nullable', 'string', 'max:250'],
                'latitude' => ['nullable', 'numeric', 'between:-90,90'],
                'longitude' => ['nullable', 'numeric', 'between:-180,180'],
                'business_field_ids' => ['nullable', 'array'],
                'business_field_ids.*' => ['exists:business_fields,id'],
            ],
            4 => [
                // Dokumen dikelola di endpoint khusus uploadDocument
            ],
            5 => [
                'instagram' => ['nullable', 'string', 'max:255'],
                'facebook' => ['nullable', 'string', 'max:255'],
                'tiktok' => ['nullable', 'string', 'max:255'],
                'youtube' => ['nullable', 'string', 'max:255'],
                'website' => ['nullable', 'string', 'max:255'],
            ],
            6 => [
                'commodities' => ['nullable', 'array'],
                'commodities.*.fish_category_id' => ['required_with:commodities', 'exists:fish_categories,id'],
                'commodities.*.capacity' => ['nullable', 'numeric', 'min:0'],
                'commodities.*.unit' => ['nullable', 'string', 'max:30'],
                'commodities.*.land_area' => ['nullable', 'numeric', 'min:0'],
            ],
            7 => [
                'membership_type' => ['nullable', 'string', 'max:100'],
            ],
            8 => [
                'signature_data' => ['nullable', 'string'],
                'signature_path' => ['nullable', 'string'],
            ],
            default => [],
        };
    }

    /**
     * Pesan validasi dalam Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor HP/WhatsApp wajib diisi.',
            'password.min' => 'Kata sandi minimal terdiri dari 8 karakter.',
            'nik.regex' => 'NIK harus tepat 16 digit angka.',
            'nib.regex' => 'NIB harus tepat 13 digit angka.',
            'business_address.max' => 'Alamat usaha tidak boleh lebih dari 250 karakter.',
            'latitude.between' => 'Titik koordinat garis lintang (latitude) tidak valid.',
            'longitude.between' => 'Titik koordinat garis bujur (longitude) tidak valid.',
            'commodities.*.fish_category_id.exists' => 'Kategori ikan komoditas yang dipilih tidak valid.',
        ];
    }
}
