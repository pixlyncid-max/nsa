<?php

namespace App\Http\Requests\Membership;

use App\Enums\BusinessScale;
use App\Enums\BusinessStatus;
use App\Enums\MembershipType;
use App\Models\BusinessField;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveBusinessStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Persiapkan data sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('annual_revenue') && is_string($this->annual_revenue)) {
            $cleanRevenue = preg_replace('/[^\d]/', '', $this->annual_revenue);
            $merge['annual_revenue'] = $cleanRevenue !== '' ? (int) $cleanRevenue : null;
        }

        if ($this->has('employee_count') && is_string($this->employee_count)) {
            $cleanEmployee = preg_replace('/[^\d]/', '', $this->employee_count);
            $merge['employee_count'] = $cleanEmployee !== '' ? (int) $cleanEmployee : null;
        }

        if ($this->has('nib') && is_string($this->nib)) {
            $merge['nib'] = trim($this->nib);
        }

        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $otherFieldId = BusinessField::where('name', 'Lainnya')->orWhere('slug', 'lainnya')->value('id');
        $selectedFields = array_map('intval', (array) $this->input('business_field_ids', []));
        $hasOtherField = $otherFieldId && in_array($otherFieldId, $selectedFields, true);

        return [
            // Kartu 1: Jenis Keanggotaan
            'membership_type' => ['required', 'string', Rule::in(MembershipType::values())],
            'membership_type_other' => [
                Rule::requiredIf(fn () => $this->input('membership_type') === 'Lainnya'),
                'nullable',
                'string',
                'max:100',
            ],

            // Kartu 2: Informasi Usaha
            'business_name' => ['required', 'string', 'max:150'],
            'owner_name' => ['required', 'string', 'max:150'],
            'nib' => ['required', 'regex:/^\d{13}$/'],
            'npwp' => ['nullable', 'string', 'max:30'],
            'founded_at' => ['required', 'date', 'before_or_equal:today'],
            'employee_count' => ['required', 'integer', 'min:1'],
            'annual_revenue' => ['required', 'integer', 'min:0'],
            'business_status' => ['required', 'string', Rule::in(BusinessStatus::values())],
            'business_scale' => ['required', 'string', Rule::in(BusinessScale::values())],

            // Kartu 3: Bidang Usaha
            'business_field_ids' => ['required', 'array', 'min:1'],
            'business_field_ids.*' => ['integer', 'exists:business_fields,id'],
            'business_field_other' => [
                Rule::requiredIf(fn () => $hasOtherField),
                'nullable',
                'string',
                'max:100',
            ],

            // Kartu 4: Alamat Usaha
            'province_id' => ['required', 'integer', 'exists:provinces,id'],
            'regency_id' => ['required', 'integer', 'exists:regencies,id'],
            'district_id' => ['required', 'integer', 'exists:districts,id'],
            'village_id' => ['required', 'integer', 'exists:villages,id'],
            'postal_code' => ['required', 'string', 'max:10'],
            'business_address' => ['required', 'string', 'max:250'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Kartu 1
            'membership_type.required' => 'Jenis keanggotaan wajib dipilih.',
            'membership_type.in' => 'Pilihan jenis keanggotaan tidak valid.',
            'membership_type_other.required' => 'Sebutkan jenis keanggotaan Anda jika memilih opsi Lainnya.',

            // Kartu 2
            'business_name.required' => 'Nama usaha atau perusahaan wajib diisi.',
            'business_name.max' => 'Nama usaha tidak boleh lebih dari 150 karakter.',
            'owner_name.required' => 'Nama pemilik atau penanggung jawab wajib diisi.',
            'owner_name.max' => 'Nama pemilik tidak boleh lebih dari 150 karakter.',
            'nib.required' => 'Nomor Induk Berusaha (NIB) wajib diisi.',
            'nib.regex' => 'NIB harus 13 digit angka.',
            'founded_at.required' => 'Tanggal berdiri usaha wajib diisi.',
            'founded_at.date' => 'Format tanggal berdiri tidak valid.',
            'founded_at.before_or_equal' => 'Tanggal berdiri usaha tidak boleh melebihi hari ini.',
            'employee_count.required' => 'Jumlah karyawan wajib diisi.',
            'employee_count.integer' => 'Jumlah karyawan harus berupa angka bulat.',
            'employee_count.min' => 'Jumlah karyawan minimal 1 orang.',
            'annual_revenue.required' => 'Omzet per tahun wajib diisi.',
            'annual_revenue.integer' => 'Omzet per tahun harus berupa angka bulat.',
            'annual_revenue.min' => 'Omzet per tahun tidak boleh negatif.',
            'business_status.required' => 'Status usaha wajib dipilih.',
            'business_status.in' => 'Status usaha yang dipilih tidak valid.',
            'business_scale.required' => 'Skala usaha wajib dipilih.',
            'business_scale.in' => 'Skala usaha yang dipilih tidak valid.',

            // Kartu 3
            'business_field_ids.required' => 'Pilih minimal 1 bidang usaha perikanan.',
            'business_field_ids.array' => 'Bidang usaha harus berupa daftar pilihan.',
            'business_field_ids.min' => 'Pilih minimal 1 bidang usaha perikanan.',
            'business_field_ids.*.exists' => 'Salah satu bidang usaha yang dipilih tidak valid.',
            'business_field_other.required' => 'Sebutkan bidang usaha Anda jika memilih opsi Lainnya.',

            // Kartu 4
            'province_id.required' => 'Provinsi lokasi usaha wajib dipilih.',
            'province_id.exists' => 'Provinsi yang dipilih tidak ditemukan.',
            'regency_id.required' => 'Kabupaten/Kota lokasi usaha wajib dipilih.',
            'regency_id.exists' => 'Kabupaten/Kota yang dipilih tidak ditemukan.',
            'district_id.required' => 'Kecamatan lokasi usaha wajib dipilih.',
            'district_id.exists' => 'Kecamatan yang dipilih tidak ditemukan.',
            'village_id.required' => 'Kelurahan/Desa lokasi usaha wajib dipilih.',
            'village_id.exists' => 'Kelurahan/Desa yang dipilih tidak ditemukan.',
            'postal_code.required' => 'Kode pos lokasi usaha wajib diisi.',
            'postal_code.max' => 'Kode pos tidak boleh lebih dari 10 karakter.',
            'business_address.required' => 'Alamat lengkap usaha wajib diisi.',
            'business_address.max' => 'Alamat lengkap usaha maksimal 250 karakter.',
            'latitude.required' => 'Titik lokasi usaha pada peta wajib ditentukan.',
            'latitude.numeric' => 'Garis lintang (latitude) harus berupa angka.',
            'latitude.between' => 'Garis lintang (latitude) tidak valid.',
            'longitude.required' => 'Titik lokasi usaha pada peta wajib ditentukan.',
            'longitude.numeric' => 'Garis bujur (longitude) harus berupa angka.',
            'longitude.between' => 'Garis bujur (longitude) tidak valid.',
        ];
    }
}
