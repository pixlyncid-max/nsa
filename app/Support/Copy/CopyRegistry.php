<?php

namespace App\Support\Copy;

use InvalidArgumentException;

class CopyRegistry
{
    /** @var list<string> */
    public const VALID_TYPES = ['text', 'textarea', 'richtext', 'button', 'link'];

    /** @var array<string, array<string, mixed>>|null */
    private ?array $entries = null;

    /** @var array<string, array<string, array<string, mixed>>>|null */
    private ?array $byGroup = null;

    /** @var array<string, string>|null */
    private ?array $englishDefaults = null;

    /** @var array<string, array<string, string>>|null */
    private ?array $englishByGroup = null;

    public function __construct(
        private readonly ?string $basePath = null,
    ) {}

    public function basePath(): string
    {
        return $this->basePath ?? resource_path('copy');
    }

    public function englishBasePath(): string
    {
        return $this->basePath().DIRECTORY_SEPARATOR.'en';
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function all(): array
    {
        $this->load();

        return $this->entries;
    }

    /**
     * @return list<string>
     */
    public function groups(): array
    {
        $this->load();

        return array_keys($this->byGroup);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function forGroup(string $group): array
    {
        $this->load();

        return $this->byGroup[$group] ?? [];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function get(string $key): ?array
    {
        $this->load();

        return $this->entries[$key] ?? null;
    }

    public function has(string $key): bool
    {
        $this->load();

        return array_key_exists($key, $this->entries);
    }

    public function groupOf(string $key): ?string
    {
        $entry = $this->get($key);

        return $entry['group'] ?? null;
    }

    /**
     * Mengembalikan seluruh nilai bawaan Inggris dari resources/copy/en/*.php.
     *
     * @return array<string, string>
     */
    public function englishDefaults(): array
    {
        $this->loadEnglish();

        return $this->englishDefaults;
    }

    /**
     * Mengembalikan nilai bawaan Inggris untuk satu kelompok.
     *
     * @return array<string, string>
     */
    public function englishDefaultsForGroup(string $group): array
    {
        $this->loadEnglish();

        return $this->englishByGroup[$group] ?? [];
    }

    /**
     * Memeriksa apakah key memiliki terjemahan bawaan Inggris non-kosong di resources/copy/en/.
     */
    public function hasEnglishDefault(string $key): bool
    {
        $this->loadEnglish();

        return isset($this->englishDefaults[$key]) && trim($this->englishDefaults[$key]) !== '';
    }

    /**
     * Mengembalikan nilai bawaan untuk locale tertentu.
     * Untuk locale 'en': bawaan registry en → bawaan registry id.
     */
    public function defaultFor(string $key, string $locale = 'id'): ?string
    {
        $entry = $this->get($key);
        if ($entry === null) {
            return null;
        }

        if ($locale === 'en') {
            $this->loadEnglish();
            if (isset($this->englishDefaults[$key]) && trim($this->englishDefaults[$key]) !== '') {
                return $this->englishDefaults[$key];
            }
        }

        return (string) $entry['default'];
    }

    /**
     * Mengembalikan batas panjang maksimal sesuai locale.
     * Untuk Inggris: pakai max_en bila ditentukan, atau beri kelonggaran +30% dari max.
     */
    public function maxFor(string $key, string $locale = 'id'): ?int
    {
        $entry = $this->get($key);
        if ($entry === null) {
            return null;
        }

        if ($locale === 'en') {
            if ($entry['max_en'] !== null) {
                return (int) $entry['max_en'];
            }

            if ($entry['max'] !== null) {
                return (int) ceil(((int) $entry['max']) * 1.3);
            }

            return null;
        }

        return $entry['max'] !== null ? (int) $entry['max'] : null;
    }

    public function flush(): void
    {
        $this->entries = null;
        $this->byGroup = null;
        $this->englishDefaults = null;
        $this->englishByGroup = null;
    }

    /**
     * Memuat dan memvalidasi seluruh file registry di resources/copy/.
     */
    private function load(): void
    {
        if ($this->entries !== null && $this->byGroup !== null) {
            return;
        }

        $directory = $this->basePath();
        if (! is_dir($directory)) {
            throw new InvalidArgumentException("Direktori registry teks tidak ditemukan: {$directory}");
        }

        $files = glob($directory.DIRECTORY_SEPARATOR.'*.php') ?: [];
        sort($files);

        $entries = [];
        $byGroup = [];

        foreach ($files as $file) {
            $group = pathinfo($file, PATHINFO_FILENAME);
            $data = require $file;

            if (! is_array($data)) {
                throw new InvalidArgumentException("File registry [{$group}.php] harus mengembalikan array.");
            }

            $byGroup[$group] = [];

            foreach ($data as $key => $meta) {
                $this->validateEntry($group, $key, $meta, $entries);

                $max = isset($meta['max']) ? (int) $meta['max'] : null;
                $maxEn = isset($meta['max_en']) ? (int) $meta['max_en'] : null;

                $normalized = [
                    'key' => $key,
                    'group' => $group,
                    'label' => $meta['label'],
                    'hint' => $meta['hint'] ?? '',
                    'type' => $meta['type'],
                    'default' => $meta['default'],
                    'max' => $max,
                    'max_en' => $maxEn,
                    'placeholders' => array_values($meta['placeholders'] ?? []),
                ];

                $entries[$key] = $normalized;
                $byGroup[$group][$key] = $normalized;
            }
        }

        $this->entries = $entries;
        $this->byGroup = $byGroup;
    }

    /**
     * Memuat seluruh file bawaan Inggris di resources/copy/en/.
     */
    private function loadEnglish(): void
    {
        if ($this->englishDefaults !== null && $this->englishByGroup !== null) {
            return;
        }

        $directory = $this->englishBasePath();
        $defaults = [];
        $byGroup = [];

        if (is_dir($directory)) {
            $files = glob($directory.DIRECTORY_SEPARATOR.'*.php') ?: [];
            sort($files);

            foreach ($files as $file) {
                $group = pathinfo($file, PATHINFO_FILENAME);
                $data = require $file;

                if (! is_array($data)) {
                    throw new InvalidArgumentException("File registry Inggris [en/{$group}.php] harus mengembalikan array.");
                }

                $byGroup[$group] = [];

                foreach ($data as $key => $value) {
                    if (! is_string($key)) {
                        continue;
                    }

                    $text = is_array($value) ? ($value['default'] ?? null) : $value;
                    if (is_string($text) && trim($text) !== '') {
                        $defaults[$key] = $text;
                        $byGroup[$group][$key] = $text;
                    }
                }
            }
        }

        $this->englishDefaults = $defaults;
        $this->englishByGroup = $byGroup;
    }

    /**
     * @param  array<string, array<string, mixed>>  $existing
     */
    private function validateEntry(string $group, mixed $key, mixed $meta, array $existing): void
    {
        if (! is_string($key) || ! preg_match('/^[a-z0-9]+(\.[a-z0-9_]+)+$/', $key)) {
            throw new InvalidArgumentException("Format key teks tidak valid di [{$group}.php]: ".var_export($key, true));
        }

        if (! str_starts_with($key, $group.'.')) {
            throw new InvalidArgumentException("Key [{$key}] harus diawali kelompok [{$group}.].");
        }

        if (array_key_exists($key, $existing)) {
            throw new InvalidArgumentException("Key teks duplikat ditemukan: [{$key}].");
        }

        if (! is_array($meta)) {
            throw new InvalidArgumentException("Definisi key [{$key}] harus berupa array.");
        }

        $type = $meta['type'] ?? null;
        if (! is_string($type) || ! in_array($type, self::VALID_TYPES, true)) {
            throw new InvalidArgumentException("Tipe tidak valid untuk key [{$key}]: ".var_export($type, true));
        }

        $default = $meta['default'] ?? null;
        if (! is_string($default) || trim($default) === '') {
            throw new InvalidArgumentException("Nilai default untuk key [{$key}] wajib diisi dan tidak boleh kosong.");
        }

        $label = $meta['label'] ?? null;
        if (! is_string($label) || trim($label) === '') {
            throw new InvalidArgumentException("Label untuk key [{$key}] wajib diisi.");
        }

        if (isset($meta['max']) && (! is_int($meta['max']) || $meta['max'] <= 0)) {
            throw new InvalidArgumentException("Batas max untuk key [{$key}] harus bilangan bulat positif.");
        }

        if (isset($meta['max_en']) && (! is_int($meta['max_en']) || $meta['max_en'] <= 0)) {
            throw new InvalidArgumentException("Batas max_en untuk key [{$key}] harus bilangan bulat positif.");
        }

        $placeholders = $meta['placeholders'] ?? [];
        if (! is_array($placeholders)) {
            throw new InvalidArgumentException("Placeholders untuk key [{$key}] harus berupa array.");
        }

        foreach ($placeholders as $placeholder) {
            if (! is_string($placeholder) || $placeholder === '') {
                throw new InvalidArgumentException("Nama placeholder tidak valid pada key [{$key}].");
            }

            if (! str_contains($default, '{'.$placeholder.'}')) {
                throw new InvalidArgumentException("Nilai default key [{$key}] harus memuat placeholder {{$placeholder}}.");
            }
        }
    }
}
