<?php

namespace App\Support;

use Illuminate\Support\Str;

class ActivityFormRules
{
    /**
     * Normalisasi string kategori pendaftar ke slug config.
     */
    public static function normalizeCategory(?string $category): string
    {
        if (empty($category)) {
            return 'lainnya';
        }

        $slug = Str::slug($category);

        if (str_contains($slug, 'pembudidaya')) {
            return 'pembudidaya';
        }
        if (str_contains($slug, 'pembenih')) {
            return 'pembenih';
        }
        if (str_contains($slug, 'pakan') || str_contains($slug, 'sarana')) {
            return 'pakan-sarana';
        }
        if (str_contains($slug, 'pengolah')) {
            return 'pengolah';
        }
        if (str_contains($slug, 'buyer') || str_contains($slug, 'ekspor')) {
            return 'buyer';
        }
        if (str_contains($slug, 'akademisi') || str_contains($slug, 'peneliti')) {
            return 'akademisi';
        }
        if (str_contains($slug, 'konsultan')) {
            return 'konsultan';
        }

        return 'lainnya';
    }

    /**
     * Ambil konfigurasi form aktivitas untuk kategori tertentu.
     *
     * @return array<string, mixed>
     */
    public static function getCategoryConfig(?string $category): array
    {
        $key = self::normalizeCategory($category);
        $configs = config('activity_forms.categories', []);

        return $configs[$key] ?? [
            'title' => 'Aktivitas Perikanan',
            'description' => 'Langkah ini bersifat opsional untuk kategori Anda.',
            'is_skippable' => true,
            'fields' => [],
        ];
    }

    /**
     * Cek apakah langkah aktivitas boleh dilewati untuk kategori ini.
     */
    public static function isSkippable(?string $category): bool
    {
        $config = self::getCategoryConfig($category);

        return ! empty($config['is_skippable']) || empty($config['fields']);
    }

    /**
     * Bangun aturan validasi Laravel dari konfigurasi field.
     *
     * @return array<string, mixed>
     */
    public static function buildRules(?string $category): array
    {
        $config = self::getCategoryConfig($category);
        $fields = $config['fields'] ?? [];

        if (empty($fields) || ! empty($config['is_skippable'])) {
            return [
                'activities' => ['nullable', 'array'],
                'activities.*.fish_category_id' => ['nullable', 'integer', 'exists:fish_categories,id'],
                'activities.*.farming_system' => ['nullable', 'string', 'max:100'],
                'activities.*.pond_count' => ['nullable', 'integer', 'min:0'],
                'activities.*.production_amount' => ['nullable', 'numeric', 'min:0'],
                'activities.*.production_unit' => ['nullable', 'string', 'max:30'],
                'activities.*.period' => ['nullable', 'string', 'max:50'],
                'activities.*.seed_need' => ['nullable', 'string', 'max:150'],
                'activities.*.feed_need' => ['nullable', 'string', 'max:150'],
                'activities.*.purchase_capacity' => ['nullable', 'string', 'max:100'],
                'activities.*.notes' => ['nullable', 'string', 'max:500'],
            ];
        }

        $rules = [
            'activities' => ['required', 'array', 'min:1'],
            'activities.*' => ['required', 'array'],
        ];

        foreach ($fields as $fieldName => $fieldMeta) {
            $validation = $fieldMeta['validation'] ?? ['nullable'];
            $rules["activities.*.{$fieldName}"] = $validation;

            if ($fieldMeta['type'] === 'number_unit_period') {
                $rules['activities.*.production_unit'] = ['nullable', 'string', 'max:30'];
                $rules['activities.*.period'] = ['nullable', 'string', 'max:50'];
            }
        }

        // Field pendukung opsional umum
        $rules['activities.*.production_unit'] = ['nullable', 'string', 'max:30'];
        $rules['activities.*.period'] = ['nullable', 'string', 'max:50'];
        $rules['activities.*.notes'] = ['nullable', 'string', 'max:500'];

        return $rules;
    }

    /**
     * Bangun pesan validasi dalam Bahasa Indonesia dari konfigurasi field.
     *
     * @return array<string, string>
     */
    public static function buildMessages(?string $category): array
    {
        $config = self::getCategoryConfig($category);
        $fields = $config['fields'] ?? [];

        $messages = [
            'activities.required' => 'Tambahkan minimal 1 data aktivitas komoditas perikanan Anda.',
            'activities.min' => 'Tambahkan minimal 1 data aktivitas komoditas perikanan Anda.',
        ];

        foreach ($fields as $fieldName => $fieldMeta) {
            $label = $fieldMeta['label'] ?? $fieldName;

            $messages["activities.*.{$fieldName}.required"] = "{$label} wajib diisi.";
            $messages["activities.*.{$fieldName}.integer"] = "{$label} harus berupa angka bulat.";
            $messages["activities.*.{$fieldName}.numeric"] = "{$label} harus berupa angka.";
            $messages["activities.*.{$fieldName}.min"] = "{$label} tidak boleh bernilai negatif.";
            $messages["activities.*.{$fieldName}.exists"] = "Pilihan {$label} tidak valid.";
            $messages["activities.*.{$fieldName}.max"] = "{$label} melebihi panjang maksimum yang diizinkan.";
        }

        return $messages;
    }
}
