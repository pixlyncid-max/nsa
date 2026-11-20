<?php

namespace App\Http\Requests\Membership;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class SaveIdentityStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation(): void
    {
        // Isi email otomatis jika dikunci / tidak dikirim dari form
        if ((! $this->has('email') || empty($this->input('email'))) && $this->user()) {
            $this->merge(['email' => $this->user()->email]);
        }

        // Jika data domisili dikirim dalam ktp_address array, ekstrak ke root
        if ($this->has('ktp_address') && is_array($this->input('ktp_address'))) {
            $ktp = $this->input('ktp_address');
            $this->merge([
                'province_id' => $ktp['province_id'] ?? $this->input('province_id'),
                'regency_id' => $ktp['regency_id'] ?? $this->input('regency_id'),
                'district_id' => $ktp['district_id'] ?? $this->input('district_id'),
                'village_id' => $ktp['village_id'] ?? $this->input('village_id'),
                'postal_code' => $ktp['postal_code'] ?? $this->input('postal_code'),
                'address' => $ktp['address'] ?? $this->input('address'),
            ]);
        }
    }

    public function rules(): array
    {
        $nationality = $this->input('nationality', 'wni');
        $settingKtp = Setting::where('key', 'membership.require_ktp_for_wni')->value('value');
        $requireKtpForWni = $settingKtp !== null ? filter_var($settingKtp, FILTER_VALIDATE_BOOLEAN) : config('membership.require_ktp_for_wni', true);

        $rules = [
            'nationality' => ['required', 'in:wni,wna'],
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'in:Laki-laki,Perempuan,male,female'],
            'birth_place' => ['required', 'string', 'max:150'],
            'birth_date' => ['required', 'date', 'before:today'],
            'phone' => ['required', 'string', 'max:25'],
            'email' => ['required', 'email', 'max:255'],
        ];

        if ($nationality === 'wni') {
            if ($requireKtpForWni) {
                $rules['nik'] = ['required', 'digits:16'];
                $rules['province_id'] = ['required', 'integer', 'exists:provinces,id'];
                $rules['regency_id'] = ['required', 'integer', 'exists:regencies,id'];
                $rules['address'] = ['required', 'string', 'max:500'];
            } else {
                $rules['nik'] = ['nullable', 'digits:16'];
                $rules['province_id'] = ['nullable', 'integer', 'exists:provinces,id'];
                $rules['regency_id'] = ['nullable', 'integer', 'exists:regencies,id'];
                $rules['address'] = ['nullable', 'string', 'max:500'];
            }
        } else {
            // WNA
            $rules['passport_number'] = ['required', 'string', 'max:50'];
            $rules['origin_country'] = ['required', 'string', 'max:100'];
            $rules['years_in_indonesia'] = ['required', 'numeric', 'min:0'];
            $rules['years_unit'] = ['nullable', 'in:bulan,tahun'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nationality.required' => 'Pilih kewarganegaraan Anda (WNI atau WNA).',
            'nationality.in' => 'Kewarganegaraan harus bernilai WNI atau WNA.',
            'full_name.required' => 'Nama lengkap wajib diisi sesuai kartu identitas.',
            'gender.required' => 'Pilih jenis kelamin Anda.',
            'gender.in' => 'Pilihan jenis kelamin tidak valid.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_date.before' => 'Tanggal lahir tidak valid (harus sebelum hari ini).',
            'phone.required' => 'Nomor telepon / WhatsApp aktif wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'nik.required' => 'Nomor Induk Kependudukan (NIK) wajib diisi untuk WNI.',
            'nik.digits' => 'NIK harus berjumlah tepat 16 digit angka.',
            'province_id.required' => 'Pilih provinsi domisili KTP Anda.',
            'regency_id.required' => 'Pilih kabupaten/kota domisili KTP Anda.',
            'address.required' => 'Alamat lengkap jalan/RT/RW wajib diisi.',
            'passport_number.required' => 'Nomor paspor aktif wajib diisi bagi WNA.',
            'origin_country.required' => 'Pilih negara asal Anda.',
            'years_in_indonesia.required' => 'Lama tinggal di Indonesia wajib diisi bagi WNA.',
        ];
    }
}
