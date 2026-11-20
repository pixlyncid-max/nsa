<?php

namespace App\Services;

use App\Jobs\TranslateSiteTextJob;
use App\Models\ActivityLog;
use App\Models\SiteText;
use App\Models\SiteTextRevision;
use App\Models\User;
use App\Support\Copy\CopyRegistry;
use App\Support\Copy\HtmlSanitizer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CopyService
{
    public function __construct(
        private readonly CopyRegistry $registry,
    ) {}

    public function cacheKey(string $group, string $locale = 'id'): string
    {
        $idFile = $this->registry->basePath().DIRECTORY_SEPARATOR.$group.'.php';
        $enFile = $this->registry->englishBasePath().DIRECTORY_SEPARATOR.$group.'.php';
        $idVersion = is_file($idFile) ? (string) filemtime($idFile) : '0';
        $enVersion = is_file($enFile) ? (string) filemtime($enFile) : '0';

        return "copy:{$locale}:{$group}:{$idVersion}:{$enVersion}";
    }

    /**
     * Mengambil teks gabungan untuk daftar kelompok sesuai urutan resolusi:
     * - en: override DB (en) → bawaan registry en → bawaan registry id
     * - id: override DB (id) → bawaan registry id
     *
     * @param  list<string>  $groups
     * @return array<string, string>
     */
    public function forGroups(array $groups, string $locale = 'id'): array
    {
        $locale = $this->normalizeLocale($locale);
        $result = [];

        foreach (array_unique($groups) as $group) {
            $groupTexts = Cache::rememberForever(
                $this->cacheKey($group, $locale),
                function () use ($group, $locale): array {
                    $definitions = $this->registry->forGroup($group);
                    if ($definitions === []) {
                        return [];
                    }

                    $englishDefaults = $locale === 'en'
                        ? $this->registry->englishDefaultsForGroup($group)
                        : [];

                    $overrides = SiteText::query()
                        ->where('group', $group)
                        ->where('locale', $locale)
                        ->whereNotNull('value')
                        ->pluck('value', 'key')
                        ->all();

                    $merged = [];
                    foreach ($definitions as $key => $meta) {
                        if (array_key_exists($key, $overrides)) {
                            $merged[$key] = (string) $overrides[$key];
                        } elseif ($locale === 'en' && isset($englishDefaults[$key]) && trim($englishDefaults[$key]) !== '') {
                            $merged[$key] = (string) $englishDefaults[$key];
                        } else {
                            $merged[$key] = (string) $meta['default'];
                        }
                    }

                    return $merged;
                }
            );

            $result = array_merge($result, $groupTexts);
        }

        return $result;
    }

    /**
     * Mengambil satu nilai teks sekaligus mengganti placeholder.
     *
     * @param  array<string, string|int>  $params
     */
    public function get(string $key, array $params = [], ?string $locale = null): string
    {
        $locale = $this->normalizeLocale($locale ?? app()->getLocale());
        $group = $this->registry->groupOf($key);
        if ($group === null) {
            return '';
        }

        $texts = $this->forGroups([$group], $locale);
        $value = $texts[$key] ?? '';

        foreach ($params as $name => $replacement) {
            $value = str_replace('{'.$name.'}', (string) $replacement, $value);
        }

        return $value;
    }

    /**
     * Memperbarui nilai teks, memvalidasi, mencatat revisi (dengan locale),
     * menghapus cache kedua locale, dan memicu terjemahan otomatis bila locale = id.
     */
    public function update(string $key, ?string $value, User $user, string $locale = 'id'): SiteText
    {
        $locale = $this->normalizeLocale($locale);
        $definition = $this->registry->get($key);
        if ($definition === null) {
            throw ValidationException::withMessages([
                'key' => ["Key teks [{$key}] tidak terdaftar di registry."],
            ]);
        }

        if ($value === null) {
            return $this->reset($key, $user, $locale);
        }

        $sanitized = $this->validateAndSanitize($definition, $value, $locale);
        $group = $definition['group'];

        $shouldDispatchTranslation = false;

        $siteText = DB::transaction(function () use ($key, $group, $locale, $sanitized, $user, &$shouldDispatchTranslation): SiteText {
            $siteText = SiteText::query()->firstOrNew([
                'key' => $key,
                'locale' => $locale,
            ]);

            $oldValue = $siteText->exists ? $siteText->value : null;

            $siteText->group = $group;
            $siteText->value = $sanitized;
            $siteText->updated_by = $user->id;

            if ($locale === 'en') {
                $siteText->is_manual = true;
                $siteText->translation_status = SiteText::STATUS_MANUAL;
                $siteText->translation_error = null;
            }

            $siteText->save();

            SiteTextRevision::create([
                'site_text_id' => $siteText->id,
                'locale' => $locale,
                'old_value' => $oldValue,
                'new_value' => $sanitized,
                'user_id' => $user->id,
                'created_at' => now(),
            ]);

            if ($locale === 'id') {
                $enRow = SiteText::query()->firstOrNew([
                    'key' => $key,
                    'locale' => 'en',
                ]);

                if (! $enRow->exists || ! $enRow->is_manual) {
                    $enRow->group = $group;
                    $enRow->is_manual = false;
                    $enRow->translation_status = SiteText::STATUS_PENDING;
                    $enRow->translation_error = null;
                    $enRow->save();

                    $shouldDispatchTranslation = true;
                }
            }

            ActivityLog::log(
                action: 'update_site_text',
                subject: "Memperbarui teks website ({$locale}): {$key}",
                meta: [
                    'key' => $key,
                    'group' => $group,
                    'locale' => $locale,
                ],
                userId: $user->id,
            );

            return $siteText;
        });

        $this->forgetGroupCache($group);

        if ($shouldDispatchTranslation) {
            TranslateSiteTextJob::dispatch($key, $sanitized, 'en', false, $user->id);
        }

        return $siteText;
    }

    /**
     * Mengembalikan teks ke nilai bawaan (value = null).
     */
    public function reset(string $key, User $user, string $locale = 'id'): SiteText
    {
        $locale = $this->normalizeLocale($locale);
        $definition = $this->registry->get($key);
        if ($definition === null) {
            throw ValidationException::withMessages([
                'key' => ["Key teks [{$key}] tidak terdaftar di registry."],
            ]);
        }

        $group = $definition['group'];

        $siteText = DB::transaction(function () use ($key, $group, $locale, $user): SiteText {
            $siteText = SiteText::query()->firstOrNew([
                'key' => $key,
                'locale' => $locale,
            ]);

            $oldValue = $siteText->exists ? $siteText->value : null;

            $siteText->group = $group;
            $siteText->value = null;
            $siteText->updated_by = $user->id;

            if ($locale === 'en') {
                $siteText->is_manual = false;
                $siteText->translation_status = SiteText::STATUS_AUTO;
                $siteText->source_hash = null;
                $siteText->translation_error = null;
            }

            $siteText->save();

            SiteTextRevision::create([
                'site_text_id' => $siteText->id,
                'locale' => $locale,
                'old_value' => $oldValue,
                'new_value' => null,
                'user_id' => $user->id,
                'created_at' => now(),
            ]);

            if ($locale === 'id') {
                $enRow = SiteText::query()
                    ->where('key', $key)
                    ->where('locale', 'en')
                    ->first();

                if ($enRow && ! $enRow->is_manual) {
                    $enRow->value = null;
                    $enRow->translation_status = SiteText::STATUS_AUTO;
                    $enRow->source_hash = null;
                    $enRow->translation_error = null;
                    $enRow->save();
                }
            }

            ActivityLog::log(
                action: 'reset_site_text',
                subject: "Mengembalikan teks website ({$locale}) ke bawaan: {$key}",
                meta: [
                    'key' => $key,
                    'group' => $group,
                    'locale' => $locale,
                ],
                userId: $user->id,
            );

            return $siteText;
        });

        $this->forgetGroupCache($group);

        return $siteText;
    }

    /**
     * Memicu terjemahan ulang otomatis untuk versi Inggris dari nilai Indonesia saat ini.
     */
    public function retranslate(string $key, User $user): SiteText
    {
        $definition = $this->registry->get($key);
        if ($definition === null) {
            throw ValidationException::withMessages([
                'key' => ["Key teks [{$key}] tidak terdaftar di registry."],
            ]);
        }

        $group = $definition['group'];
        $idRecord = SiteText::query()
            ->where('key', $key)
            ->where('locale', 'id')
            ->first();

        $sourceText = $idRecord?->value ?? (string) $definition['default'];

        $enRow = SiteText::query()->firstOrNew([
            'key' => $key,
            'locale' => 'en',
        ]);
        $enRow->group = $group;
        $enRow->is_manual = false;
        $enRow->translation_status = SiteText::STATUS_PENDING;
        $enRow->translation_error = null;
        $enRow->updated_by = $user->id;
        $enRow->save();

        $this->forgetGroupCache($group);

        TranslateSiteTextJob::dispatch($key, $sourceText, 'en', true, $user->id);

        return $enRow->fresh() ?? $enRow;
    }

    /**
     * Melepas kunci manual EN dan mengembalikan ke mode terjemahan otomatis.
     */
    public function revertToAuto(string $key, User $user): SiteText
    {
        $definition = $this->registry->get($key);
        if ($definition === null) {
            throw ValidationException::withMessages([
                'key' => ["Key teks [{$key}] tidak terdaftar di registry."],
            ]);
        }

        $group = $definition['group'];
        $idRecord = SiteText::query()
            ->where('key', $key)
            ->where('locale', 'id')
            ->first();

        $hasIdOverride = $idRecord !== null && $idRecord->value !== null;

        if ($hasIdOverride) {
            return $this->retranslate($key, $user);
        }

        return $this->reset($key, $user, 'en');
    }

    /**
     * Memulihkan teks ke nilai dari revisi tertentu.
     */
    public function restore(int $revisionId, User $user): SiteText
    {
        $revision = SiteTextRevision::query()->with('siteText')->findOrFail($revisionId);
        $siteText = $revision->siteText;
        $locale = $revision->locale ?: $siteText->locale;

        if ($revision->new_value === null) {
            return $this->reset($siteText->key, $user, $locale);
        }

        $restored = $this->update($siteText->key, $revision->new_value, $user, $locale);

        ActivityLog::log(
            action: 'restore_site_text',
            subject: "Memulihkan revisi #{$revision->id} ({$locale}) untuk teks: {$siteText->key}",
            meta: [
                'key' => $siteText->key,
                'locale' => $locale,
                'revision_id' => $revision->id,
            ],
            userId: $user->id,
        );

        return $restored;
    }

    /**
     * Menghapus cache kelompok untuk SEMUA locale (id & en) agar perubahan selalu sinkron.
     */
    public function forgetGroupCache(string $group, ?string $locale = null): void
    {
        $locales = (array) config('locales.supported', ['id', 'en']);
        if ($locale !== null && ! in_array($locale, $locales, true)) {
            $locales[] = $locale;
        }

        foreach (array_unique($locales) as $loc) {
            Cache::forget($this->cacheKey($group, (string) $loc));
        }
    }

    /**
     * Mengekspor seluruh teks yang diubah dari bawaan (value != null).
     *
     * @return list<array{key: string, value: string, locale: string}>
     */
    public function exportCustomized(?string $locale = null): array
    {
        $query = SiteText::query()
            ->whereNotNull('value')
            ->orderBy('group')
            ->orderBy('key')
            ->orderBy('locale');

        if ($locale !== null) {
            $query->where('locale', $this->normalizeLocale($locale));
        }

        return $query
            ->get(['key', 'value', 'locale'])
            ->map(fn (SiteText $row) => [
                'key' => $row->key,
                'value' => (string) $row->value,
                'locale' => $row->locale,
            ])
            ->values()
            ->all();
    }

    /**
     * Membuat pratinjau perbedaan untuk data impor JSON.
     *
     * @param  list<array<string, mixed>>  $rawItems
     * @return array{
     *   items: list<array<string, mixed>>,
     *   summary: array{total: int, applicable: int, warnings: int, unchanged: int}
     * }
     */
    public function previewImport(array $rawItems, string $defaultLocale = 'id'): array
    {
        $overridesByLocale = SiteText::query()
            ->get(['key', 'locale', 'value'])
            ->groupBy('locale')
            ->map(fn ($rows) => $rows->pluck('value', 'key')->all())
            ->all();

        $preview = [];
        $applicable = 0;
        $warningsCount = 0;
        $unchanged = 0;

        foreach ($rawItems as $raw) {
            $key = is_string($raw['key'] ?? null) ? trim($raw['key']) : '';
            $value = is_string($raw['value'] ?? null) ? $raw['value'] : null;
            $locale = $this->normalizeLocale(
                is_string($raw['locale'] ?? null) && $raw['locale'] !== '' ? $raw['locale'] : $defaultLocale
            );
            $definition = $key !== '' ? $this->registry->get($key) : null;

            $warnings = [];
            if ($definition === null) {
                $warnings[] = 'Key tidak terdaftar di registry.';
            } elseif ($value !== null) {
                if (trim($value) === '') {
                    $warnings[] = 'Nilai teks tidak boleh kosong.';
                } else {
                    $sanitized = $definition['type'] === 'richtext'
                        ? HtmlSanitizer::sanitize($value)
                        : HtmlSanitizer::escapePlainText($value);

                    $length = $definition['type'] === 'richtext'
                        ? mb_strlen(trim(strip_tags($sanitized)))
                        : mb_strlen($value);

                    $max = $this->registry->maxFor($key, $locale);
                    if ($max !== null && $length > $max) {
                        $warnings[] = "Melebihi batas maksimal {$max} karakter ({$length}).";
                    }

                    foreach ($definition['placeholders'] ?? [] as $placeholder) {
                        if (! str_contains($sanitized, '{'.$placeholder.'}')) {
                            $warnings[] = "Placeholder wajib {{$placeholder}} hilang.";
                        }
                    }
                }
            }

            $defaultVal = $definition !== null ? $this->registry->defaultFor($key, $locale) : null;
            $oldValue = $definition !== null
                ? ($overridesByLocale[$locale][$key] ?? $defaultVal)
                : null;

            $targetValue = $value ?? $defaultVal;
            $isUnchanged = $warnings === [] && $oldValue === $targetValue;

            if ($warnings !== []) {
                $status = 'warning';
                $warningsCount++;
            } elseif ($isUnchanged) {
                $status = 'unchanged';
                $unchanged++;
            } else {
                $status = 'valid';
                $applicable++;
            }

            $preview[] = [
                'key' => $key,
                'label' => $definition['label'] ?? $key,
                'locale' => $locale,
                'oldValue' => $oldValue,
                'newValue' => $value,
                'status' => $status,
                'warnings' => $warnings,
            ];
        }

        return [
            'items' => $preview,
            'summary' => [
                'total' => count($preview),
                'applicable' => $applicable,
                'warnings' => $warningsCount,
                'unchanged' => $unchanged,
            ],
        ];
    }

    /**
     * Menerapkan impor teks yang valid dalam satu transaksi database dan mencatat revisi.
     *
     * @param  list<array<string, mixed>>  $rawItems
     * @return array{applied: int, skipped: int}
     */
    public function applyImport(array $rawItems, User $user, string $defaultLocale = 'id'): array
    {
        $preview = $this->previewImport($rawItems, $defaultLocale);
        $validItems = array_values(array_filter(
            $preview['items'],
            fn (array $item) => $item['status'] === 'valid'
        ));

        $applied = 0;

        foreach ($validItems as $item) {
            $this->update($item['key'], $item['newValue'], $user, $item['locale']);
            $applied++;
        }

        if ($applied > 0) {
            ActivityLog::log(
                action: 'import_site_texts',
                subject: "Mengimpor {$applied} teks website dari JSON",
                meta: ['applied' => $applied],
                userId: $user->id,
            );
        }

        return [
            'applied' => $applied,
            'skipped' => count($rawItems) - $applied,
        ];
    }

    private function normalizeLocale(string $locale): string
    {
        $supported = (array) config('locales.supported', ['id', 'en']);

        return in_array($locale, $supported, true) ? $locale : 'id';
    }

    /**
     * @param  array<string, mixed>  $definition
     */
    private function validateAndSanitize(array $definition, string $value, string $locale = 'id'): string
    {
        $type = $definition['type'];
        $max = $this->registry->maxFor($definition['key'], $locale);
        $placeholders = $definition['placeholders'] ?? [];

        if (trim($value) === '') {
            throw ValidationException::withMessages([
                'value' => ['Nilai teks tidak boleh kosong. Gunakan aksi reset untuk kembali ke bawaan.'],
            ]);
        }

        if ($type === 'richtext') {
            $sanitized = HtmlSanitizer::sanitize($value);
            $plainLength = mb_strlen(trim(strip_tags($sanitized)));

            if ($max !== null && $plainLength > $max) {
                throw ValidationException::withMessages([
                    'value' => ["Panjang teks melebihi batas maksimal {$max} karakter."],
                ]);
            }
        } else {
            if ($max !== null && mb_strlen($value) > $max) {
                throw ValidationException::withMessages([
                    'value' => ["Panjang teks melebihi batas maksimal {$max} karakter."],
                ]);
            }

            $sanitized = HtmlSanitizer::escapePlainText($value);
        }

        foreach ($placeholders as $placeholder) {
            if (! str_contains($sanitized, '{'.$placeholder.'}')) {
                throw ValidationException::withMessages([
                    'value' => ["Placeholder wajib {{$placeholder}} tidak boleh dihapus."],
                ]);
            }
        }

        return $sanitized;
    }
}
