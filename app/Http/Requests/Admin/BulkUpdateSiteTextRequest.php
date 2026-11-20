<?php

namespace App\Http\Requests\Admin;

use App\Models\SiteText;
use App\Support\Copy\CopyRegistry;
use App\Support\Copy\HtmlSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BulkUpdateSiteTextRequest extends FormRequest
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
            'items' => ['required', 'array', 'min:1'],
            'items.*.key' => ['required', 'string'],
            'items.*.value' => ['nullable', 'string'],
            'items.*.locale' => ['nullable', 'string', Rule::in((array) config('locales.supported', ['id', 'en']))],
        ];
    }

    public function after(CopyRegistry $registry): array
    {
        return [
            function (Validator $validator) use ($registry): void {
                $items = $this->input('items', []);
                if (! is_array($items)) {
                    return;
                }

                foreach ($items as $index => $item) {
                    $key = (string) ($item['key'] ?? '');
                    $value = $item['value'] ?? null;
                    $locale = (string) (($item['locale'] ?? null) ?: 'id');
                    $definition = $registry->get($key);

                    if ($definition === null) {
                        $validator->errors()->add("items.{$index}.key", "Key teks [{$key}] tidak terdaftar di registry.");

                        continue;
                    }

                    if ($value === null) {
                        continue;
                    }

                    if (! is_string($value) || trim($value) === '') {
                        $validator->errors()->add("items.{$index}.value", "Nilai untuk [{$definition['label']}] tidak boleh kosong.");

                        continue;
                    }

                    $type = $definition['type'];
                    $max = $registry->maxFor($key, $locale);
                    $placeholders = $definition['placeholders'] ?? [];

                    $sanitized = $type === 'richtext'
                        ? HtmlSanitizer::sanitize($value)
                        : HtmlSanitizer::escapePlainText($value);
                    $length = $type === 'richtext'
                        ? mb_strlen(trim(strip_tags($sanitized)))
                        : mb_strlen($value);

                    if ($max !== null && $length > $max) {
                        $validator->errors()->add(
                            "items.{$index}.value",
                            "{$definition['label']}: panjang teks ({$length}) melebihi batas maksimal {$max} karakter."
                        );
                    }

                    foreach ($placeholders as $placeholder) {
                        if (! str_contains($sanitized, '{'.$placeholder.'}')) {
                            $validator->errors()->add(
                                "items.{$index}.value",
                                "{$definition['label']}: placeholder wajib {{$placeholder}} tidak boleh dihapus."
                            );
                        }
                    }
                }
            },
        ];
    }
}
