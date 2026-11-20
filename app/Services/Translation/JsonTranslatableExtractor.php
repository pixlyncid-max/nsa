<?php

namespace App\Services\Translation;

use Illuminate\Support\Arr;

class JsonTranslatableExtractor
{
    /** @var list<string> */
    private const IGNORED_KEY_NAMES = [
        'id',
        'slug',
        'url',
        'href',
        'src',
        'image',
        'photo',
        'avatar',
        'logo',
        'cover',
        'icon',
        'color',
        'email',
        'phone',
        'year',
        'date',
        'created_at',
        'updated_at',
        'type',
        'status',
    ];

    /**
     * Mengekstrak hanya leaf string yang layak diterjemahkan dari array JSON.
     * Mengembalikan peta [ "body.sejarah.0.title" => "Teks asli" ].
     *
     * @param  array<string|int, mixed>  $data
     * @return array<string, string>
     */
    public static function extract(array $data, string $rootField): array
    {
        $leaves = [];
        self::walk($data, $rootField, $leaves);

        return $leaves;
    }

    /**
     * Menerapkan peta terjemahan [ "body.sejarah.0.title" => "Translated" ] kembali ke array JSON.
     *
     * @param  array<string|int, mixed>  $original
     * @param  array<string, string>  $translations
     * @return array<string|int, mixed>
     */
    public static function apply(array $original, array $translations, string $rootField): array
    {
        $prefix = $rootField.'.';
        $result = $original;

        foreach ($translations as $path => $translatedValue) {
            if (! str_starts_with($path, $prefix)) {
                continue;
            }
            $relative = substr($path, strlen($prefix));
            if ($relative !== '' && Arr::has($result, $relative)) {
                Arr::set($result, $relative, $translatedValue);
            }
        }

        return $result;
    }

    /**
     * @param  array<string|int, mixed>  $node
     * @param  array<string, string>  $leaves
     */
    private static function walk(array $node, string $prefix, array &$leaves): void
    {
        foreach ($node as $key => $value) {
            $path = $prefix.'.'.$key;

            if (is_string($key) && in_array(strtolower($key), self::IGNORED_KEY_NAMES, true)) {
                continue;
            }

            if (is_array($value)) {
                self::walk($value, $path, $leaves);

                continue;
            }

            if (is_string($value) && self::isTranslatableString($value)) {
                $leaves[$path] = $value;
            }
        }
    }

    public static function isTranslatableString(string $value): bool
    {
        $trimmed = trim($value);
        if ($trimmed === '' || mb_strlen($trimmed) < 2) {
            return false;
        }

        // Abaikan URL, path relatif, email, warna hex, angka murni, tanggal ISO, atau path berkas
        if (
            preg_match('/^(https?:\/\/|mailto:|tel:|\/|#)/i', $trimmed) === 1
            || filter_var($trimmed, FILTER_VALIDATE_EMAIL) !== false
            || preg_match('/^#[0-9a-f]{3,8}$/i', $trimmed) === 1
            || preg_match('/^\d+(?:[.,:\-\/]\d+)*$/', $trimmed) === 1
            || preg_match('/\.(jpg|jpeg|png|webp|avif|svg|gif|pdf|docx?|xlsx?)$/i', $trimmed) === 1
        ) {
            return false;
        }

        // Harus mengandung setidaknya satu huruf
        return preg_match('/\p{L}/u', $trimmed) === 1;
    }
}
