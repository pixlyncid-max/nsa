<?php

namespace App\Http\Requests\Admin;

use App\Models\SiteText;
use App\Support\Copy\CopyRegistry;
use App\Support\Copy\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateSiteTextRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', SiteText::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'value' => ['nullable', 'string'],
            'locale' => ['nullable', 'string', Rule::in((array) config('locales.supported', ['id', 'en']))],
        ];
    }

    public function after(CopyRegistry $registry): array
    {
        return [
            function (Validator $validator) use ($registry): void {
                $key = (string) $this->route('key');
                $locale = (string) ($this->input('locale') ?: 'id');
                $definition = $registry->get($key);

                if ($definition === null) {
                    $validator->errors()->add('key', "Key teks [{$key}] tidak terdaftar di registry.");

                    return;
                }

                $value = $this->input('value');
                if ($value === null) {
                    return;
                }

                if (! is_string($value) || trim($value) === '') {
                    $validator->errors()->add('value', 'Nilai teks tidak boleh kosong. Gunakan Reset ke default untuk mengembalikan nilai bawaan.');

                    return;
                }

                $type = $definition['type'];
                $max = $registry->maxFor($key, $locale);
                $placeholders = $definition['placeholders'] ?? [];

                if ($type === 'richtext') {
                    $sanitized = HtmlSanitizer::sanitize($value);
                    $length = mb_strlen(trim(strip_tags($sanitized)));
                } else {
                    $sanitized = HtmlSanitizer::escapePlainText($value);
                    $length = mb_strlen($value);
                }

                if ($max !== null && $length > $max) {
                    $validator->errors()->add('value', "Panjang teks ({$length}) melebihi batas maksimal {$max} karakter.");
                }

                if ($type === 'link') {
                    $lower = strtolower(trim($value));
                    if (str_starts_with($lower, 'javascript:') || str_starts_with($lower, 'vbscript:') || str_starts_with($lower, 'data:')) {
                        $validator->errors()->add('value', 'URL tautan tidak aman.');
                    } elseif (preg_match('/^(https?:\/\/|\/|#|mailto:|tel:)/i', (string) $definition['default'])) {
                        $isValidUrl = filter_var($value, FILTER_VALIDATE_URL) !== false
                            || preg_match('/^(\/|#|mailto:|tel:)/i', trim($value)) === 1;
                        if (! $isValidUrl) {
                            $validator->errors()->add('value', 'Format URL tautan tidak valid.');
                        }
                    }
                }

                foreach ($placeholders as $placeholder) {
                    if (! str_contains($sanitized, '{'.$placeholder.'}')) {
                        $validator->errors()->add('value', "Placeholder wajib {{$placeholder}} tidak boleh dihapus.");
                    }
                }
            },
        ];
    }
}
