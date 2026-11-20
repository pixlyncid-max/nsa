<?php

namespace App\Models\Concerns;

use App\Jobs\TranslateModelJob;
use App\Models\ContentTranslation;
use App\Services\Translation\JsonTranslatableExtractor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Schema;

trait HasAutoTranslations
{
    public static function bootHasAutoTranslations(): void
    {
        static::saved(function (Model $model): void {
            /** @var self $model */
            $model->queueAutoTranslations();
        });
    }

    public function translations(): MorphMany
    {
        return $this->morphMany(ContentTranslation::class, 'translatable');
    }

    /**
     * Eager-load hanya terjemahan untuk bahasa aktif agar tidak ada N+1.
     */
    public function scopeWithLocale(Builder $query, ?string $locale = null): Builder
    {
        $activeLocale = $locale ?? app()->getLocale();
        $sourceLocale = (string) config('translation.source_locale', 'id');

        if ($activeLocale === $sourceLocale) {
            return $query;
        }

        return $query->with([
            'translations' => fn (MorphMany $relation) => $relation
                ->where('locale', $activeLocale)
                ->whereIn('status', [
                    ContentTranslation::STATUS_DONE,
                    ContentTranslation::STATUS_MANUAL,
                ]),
        ]);
    }

    /**
     * @return list<string>
     */
    public function getTranslatableFields(): array
    {
        return property_exists($this, 'translatable') ? (array) $this->translatable : [];
    }

    /**
     * @return list<string>
     */
    public function getTranslatableJsonFields(): array
    {
        return property_exists($this, 'translatableJson') ? (array) $this->translatableJson : [];
    }

    /**
     * @return list<string>
     */
    public function getTranslatableHtmlFields(): array
    {
        return property_exists($this, 'translatableHtml') ? (array) $this->translatableHtml : [];
    }

    /**
     * Kumpulkan semua pasangan [field => teksSumber] yang layak diterjemahkan dari model ini.
     *
     * @return array<string, string>
     */
    public function collectTranslatableSources(): array
    {
        $sources = [];

        foreach ($this->getTranslatableFields() as $field) {
            $value = $this->getAttribute($field);
            if (is_string($value) && trim($value) !== '') {
                $sources[$field] = $value;
            }
        }

        foreach ($this->getTranslatableJsonFields() as $jsonField) {
            $raw = $this->getAttribute($jsonField);
            if (is_string($raw)) {
                $decoded = json_decode($raw, true);
                $raw = is_array($decoded) ? $decoded : null;
            }
            if (is_array($raw)) {
                $leaves = JsonTranslatableExtractor::extract($raw, $jsonField);
                foreach ($leaves as $path => $leafValue) {
                    $sources[$path] = $leafValue;
                }
            }
        }

        return $sources;
    }

    /**
     * Evaluasi hash tiap field dan kirim TranslateModelJob bila ada perubahan.
     */
    public function queueAutoTranslations(bool $force = false): bool
    {
        if (! Schema::hasTable('content_translations')) {
            return false;
        }

        $targetLocales = (array) config('translation.target_locales', ['en']);
        $sources = $this->collectTranslatableSources();
        $dispatchedAny = false;

        foreach ($targetLocales as $locale) {
            $existing = $this->translations()
                ->where('locale', $locale)
                ->get()
                ->keyBy('field');

            // Hapus terjemahan non-manual untuk field yang kini dikosongkan
            foreach ($existing as $field => $translation) {
                if (! array_key_exists($field, $sources) && ! $translation->is_manual) {
                    $translation->delete();
                }
            }

            $hasPending = false;

            foreach ($sources as $field => $text) {
                $hash = hash('sha256', $text);
                /** @var ContentTranslation|null $record */
                $record = $existing->get($field);

                // Jangan pernah menimpa terjemahan manual
                if ($record && $record->is_manual) {
                    continue;
                }

                // Dedup: hash sama dan sudah selesai (kecuali --force)
                if (
                    ! $force
                    && $record
                    && $record->source_hash === $hash
                    && $record->status === ContentTranslation::STATUS_DONE
                ) {
                    continue;
                }

                ContentTranslation::query()->updateOrCreate(
                    [
                        'translatable_type' => $this->getMorphClass(),
                        'translatable_id' => $this->getKey(),
                        'field' => $field,
                        'locale' => $locale,
                    ],
                    [
                        'source_hash' => $hash,
                        'status' => ContentTranslation::STATUS_PENDING,
                        'error' => null,
                    ]
                );

                $hasPending = true;
            }

            if ($hasPending) {
                TranslateModelJob::dispatch(static::class, $this->getKey(), $locale)
                    ->onQueue((string) config('translation.queue', 'translations'));
                $dispatchedAny = true;
            }
        }

        return $dispatchedAny;
    }

    /**
     * Membaca field sesuai bahasa aktif dengan fallback aman ke nilai asli (Indonesia).
     */
    public function tr(string $field, ?string $locale = null): mixed
    {
        $activeLocale = $locale ?? app()->getLocale();
        $sourceLocale = (string) config('translation.source_locale', 'id');
        $original = $this->getAttribute($field);

        if ($activeLocale === $sourceLocale) {
            return $original;
        }

        $translations = $this->relationLoaded('translations')
            ? $this->getRelation('translations')
                ->where('locale', $activeLocale)
                ->whereIn('status', [
                    ContentTranslation::STATUS_DONE,
                    ContentTranslation::STATUS_MANUAL,
                ])
            : $this->translations()
                ->where('locale', $activeLocale)
                ->whereIn('status', [
                    ContentTranslation::STATUS_DONE,
                    ContentTranslation::STATUS_MANUAL,
                ])
                ->get();

        // Kolom JSON: gabungkan seluruh leaf terjemahan ke struktur asli
        if (in_array($field, $this->getTranslatableJsonFields(), true)) {
            $decoded = is_string($original) ? json_decode($original, true) : $original;
            if (! is_array($decoded)) {
                return $original;
            }

            $map = $translations
                ->filter(fn (ContentTranslation $t) => $t->value !== null && $t->value !== '')
                ->pluck('value', 'field')
                ->all();

            return JsonTranslatableExtractor::apply($decoded, $map, $field);
        }

        /** @var ContentTranslation|null $match */
        $match = $translations->firstWhere('field', $field);

        if ($match && is_string($match->value) && trim($match->value) !== '') {
            return $match->value;
        }

        return $original;
    }
}
