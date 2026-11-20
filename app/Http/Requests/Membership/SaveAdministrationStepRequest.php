<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;

class SaveAdministrationStepRequest extends FormRequest
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
            'items' => ['required', 'array', 'min:1'],
            'items.*.fee_item_id' => ['required', 'exists:membership_fee_items,id'],
            'items.*.selected' => ['nullable', 'boolean'],
            'items.*.qty' => ['nullable', 'integer', 'min:1', 'max:20'],
            'items.*.size' => ['nullable', 'string', 'max:10'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Daftar rincian paket dan administrasi wajib disertakan.',
            'items.min' => 'Minimal 1 item biaya administrasi wajib dipilih.',
            'items.*.fee_item_id.required' => 'Item biaya keanggotaan tidak valid.',
            'items.*.fee_item_id.exists' => 'Item biaya keanggotaan tidak ditemukan.',
            'items.*.qty.min' => 'Jumlah pesanan minimal 1.',
            'items.*.qty.max' => 'Jumlah pesanan maksimal 20.',
        ];
    }
}
