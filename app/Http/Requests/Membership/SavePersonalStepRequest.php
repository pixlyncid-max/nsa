<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SavePersonalStepRequest extends FormRequest
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
        $minAgeDate = now()->subYears(17)->format('Y-m-d');

        $rules = [
            'nik' => ['required', 'string', 'regex:/^\d{16}$/'],
            'name_ktp' => ['required', 'string', 'max:150'],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date', 'before_or_equal:'.$minAgeDate],
            'gender' => ['required', 'in:male,female,Laki-laki,Perempuan'],
            'occupation' => ['required', 'string', 'max:100'],
            'province_id' => ['required', 'exists:provinces,id'],
            'regency_id' => ['required', 'exists:regencies,id'],
            'district_id' => ['required', 'exists:districts,id'],
            'village_id' => ['required', 'exists:villages,id'],
            'postal_code' => ['required', 'string', 'max:10'],
            'address' => ['required', 'string', 'max:250'],
            'is_domicile_same' => ['nullable', 'boolean'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];

        // Jika alamat domisili berbeda dengan KTP
        if ($this->boolean('is_domicile_same') === false) {
            $rules['domicile_address'] = ['required', 'string', 'max:250'];
            $rules['domicile_province_id'] = ['required', 'exists:provinces,id'];
            $rules['domicile_regency_id'] = ['required', 'exists:regencies,id'];
            $rules['domicile_district_id'] = ['required', 'exists:districts,id'];
            $rules['domicile_village_id'] = ['required', 'exists:villages,id'];
            $rules['domicile_postal_code'] = ['required', 'string', 'max:10'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nik.required' => 'Nomor Induk Kependudukan (NIK) wajib diisi.',
            'nik.regex' => 'NIK harus 16 digit angka.',
            'name_ktp.required' => 'Nama sesuai KTP wajib diisi.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.before_or_equal' => 'Usia minimal pendaftar adalah 17 tahun.',
            'gender.required' => 'Pilih jenis kelamin Anda.',
            'gender.in' => 'Pilihan jenis kelamin tidak valid.',
            'occupation.required' => 'Pekerjaan utama wajib diisi.',
            'province_id.required' => 'Pilih provinsi sesuai KTP.',
            'regency_id.required' => 'Pilih kabupaten/kota sesuai KTP.',
            'district_id.required' => 'Pilih kecamatan sesuai KTP.',
            'village_id.required' => 'Pilih kelurahan/desa sesuai KTP.',
            'postal_code.required' => 'Kode pos wajib diisi.',
            'address.required' => 'Alamat lengkap KTP wajib diisi.',
            'address.max' => 'Alamat lengkap maksimal 250 karakter.',
            'domicile_address.required' => 'Alamat lengkap domisili wajib diisi jika berbeda dari KTP.',
            'domicile_address.max' => 'Alamat domisili maksimal 250 karakter.',
            'domicile_province_id.required' => 'Pilih provinsi domisili.',
            'domicile_regency_id.required' => 'Pilih kabupaten/kota domisili.',
            'domicile_district_id.required' => 'Pilih kecamatan domisili.',
            'domicile_village_id.required' => 'Pilih kelurahan/desa domisili.',
            'domicile_postal_code.required' => 'Kode pos domisili wajib diisi.',
            'photo.image' => 'Berkas foto harus berupa gambar.',
            'photo.mimes' => 'Format foto harus berupa JPG atau PNG.',
            'photo.max' => 'Foto tidak boleh lebih dari 2 MB.',
        ];
    }
}
