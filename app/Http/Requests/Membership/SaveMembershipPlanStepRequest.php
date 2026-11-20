<?php

namespace App\Http\Requests\Membership;

use App\Support\Brand;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveMembershipPlanStepRequest extends FormRequest
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
            'membership_plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
            'membership_type' => ['nullable', 'string', 'max:100'],
            'dpc_id' => ['nullable', 'integer', 'exists:dpcs,id'],
            'previous_organization' => ['nullable', 'string', 'max:255'],
            'recommender_name' => ['nullable', 'string', 'max:255'],
            'join_reason' => ['required', 'string', 'max:500'],
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
            'membership_plan_id.required' => "Silakan pilih salah satu paket keanggotaan {$short}.",
            'membership_plan_id.exists' => 'Paket keanggotaan yang dipilih tidak terdaftar.',
            'dpc_id.exists' => 'Cabang DPC yang dipilih tidak valid.',
            'previous_organization.max' => 'Nama organisasi sebelumnya maksimal 255 karakter.',
            'recommender_name.max' => 'Nama perekomendasi maksimal 255 karakter.',
            'join_reason.required' => "Tuliskan alasan Anda ingin bergabung dengan asosiasi {$short}.",
            'join_reason.max' => 'Alasan bergabung maksimal 500 karakter.',
        ];
    }
}
