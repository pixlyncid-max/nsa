<?php

namespace App\Http\Requests\Membership;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveCommoditiesStepRequest extends FormRequest
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
        return [
            'commodities' => ['required', 'array', 'min:1'],
            'commodities.*.fish_category_id' => ['required', 'integer', 'exists:fish_categories,id'],
            'commodities.*.cultivation_type' => [
                'required',
                'string',
                'in:Kolam tanah,Kolam terpal,Kolam beton,Keramba Jaring Apung,Tambak,Bioflok,Penangkapan',
            ],
            'commodities.*.capacity' => ['required', 'numeric', 'gt:0'],
            'commodities.*.capacity_unit' => ['nullable', 'string', 'in:kg,ton,ekor'],
            'commodities.*.production_period' => ['nullable', 'string', 'in:bulan,tahun'],
            'commodities.*.unit' => ['nullable', 'string', 'max:50'],
            'commodities.*.land_area' => ['required', 'numeric', 'gt:0'],
            'commodities.*.land_area_unit' => ['nullable', 'string', 'in:m2,ha'],
            'commodities.*.pond_count' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Pesan kustom dalam Bahasa Indonesia ramah pengguna.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'commodities.required' => 'Tambahkan minimal 1 (satu) data komoditas perikanan utama Anda.',
            'commodities.array' => 'Format daftar komoditas tidak valid.',
            'commodities.min' => 'Tambahkan minimal 1 (satu) data komoditas perikanan utama Anda.',
            'commodities.*.fish_category_id.required' => 'Pilih jenis ikan / biota perairan untuk setiap komoditas.',
            'commodities.*.fish_category_id.exists' => 'Jenis komoditas yang dipilih tidak valid.',
            'commodities.*.cultivation_type.required' => 'Pilih jenis budidaya untuk setiap komoditas.',
            'commodities.*.cultivation_type.in' => 'Jenis budidaya tidak sesuai dengan opsi yang tersedia.',
            'commodities.*.capacity.required' => 'Kapasitas produksi wajib diisi.',
            'commodities.*.capacity.numeric' => 'Kapasitas produksi harus berupa angka.',
            'commodities.*.capacity.gt' => 'Kapasitas produksi harus lebih besar dari 0.',
            'commodities.*.land_area.required' => 'Luas lahan / kolam wajib diisi.',
            'commodities.*.land_area.numeric' => 'Luas lahan / kolam harus berupa angka.',
            'commodities.*.land_area.gt' => 'Luas lahan / kolam harus lebih besar dari 0.',
            'commodities.*.pond_count.integer' => 'Jumlah kolam harus berupa bilangan bulat.',
            'commodities.*.pond_count.min' => 'Jumlah kolam minimal 1 jika diisi.',
        ];
    }
}
