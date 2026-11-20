<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SaveLocationDocumentsStepRequest extends FormRequest
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
            // Kartu 1: Alamat Domisili
            'domicile' => ['required', 'array'],
            'domicile.province_id' => ['required', 'exists:provinces,id'],
            'domicile.regency_id' => ['required', 'exists:regencies,id'],
            'domicile.district_id' => ['required', 'exists:districts,id'],
            'domicile.village_id' => ['required', 'exists:villages,id'],
            'domicile.postal_code' => ['nullable', 'string', 'max:10'],
            'domicile.address' => ['required', 'string', 'max:250'],

            // Pilihan Alamat Usaha Berbeda
            'is_business_address_different' => ['nullable', 'boolean'],
            'business_address' => ['nullable', 'array'],
            'business_address.province_id' => ['required_if:is_business_address_different,true,1', 'nullable', 'exists:provinces,id'],
            'business_address.regency_id' => ['required_if:is_business_address_different,true,1', 'nullable', 'exists:regencies,id'],
            'business_address.district_id' => ['required_if:is_business_address_different,true,1', 'nullable', 'exists:districts,id'],
            'business_address.village_id' => ['required_if:is_business_address_different,true,1', 'nullable', 'exists:villages,id'],
            'business_address.postal_code' => ['nullable', 'string', 'max:10'],
            'business_address.address' => ['required_if:is_business_address_different,true,1', 'nullable', 'string', 'max:250'],

            // Kartu 2: Lokasi Kegiatan (Multi titik koordinat)
            'activity_locations' => ['nullable', 'array'],
            'activity_locations.*.latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'activity_locations.*.longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'activity_locations.*.label' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'domicile.province_id.required' => 'Provinsi domisili wajib dipilih.',
            'domicile.regency_id.required' => 'Kabupaten/Kota domisili wajib dipilih.',
            'domicile.district_id.required' => 'Kecamatan domisili wajib dipilih.',
            'domicile.village_id.required' => 'Kelurahan/Desa domisili wajib dipilih.',
            'domicile.address.required' => 'Alamat lengkap domisili wajib diisi.',
            'domicile.address.max' => 'Alamat domisili maksimal 250 karakter.',

            'business_address.province_id.required_if' => 'Provinsi usaha wajib dipilih bila alamat usaha berbeda.',
            'business_address.regency_id.required_if' => 'Kabupaten/Kota usaha wajib dipilih bila alamat usaha berbeda.',
            'business_address.district_id.required_if' => 'Kecamatan usaha wajib dipilih bila alamat usaha berbeda.',
            'business_address.village_id.required_if' => 'Kelurahan/Desa usaha wajib dipilih bila alamat usaha berbeda.',
            'business_address.address.required_if' => 'Alamat lengkap usaha wajib diisi bila alamat usaha berbeda.',
            'business_address.address.max' => 'Alamat usaha maksimal 250 karakter.',

            'activity_locations.*.latitude.numeric' => 'Latitude lokasi kegiatan harus berupa angka yang valid.',
            'activity_locations.*.longitude.numeric' => 'Longitude lokasi kegiatan harus berupa angka yang valid.',
        ];
    }
}
